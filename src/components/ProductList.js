import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newImages, setNewImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter((product) => product.id !== id));
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product: ", error);
      }
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct({ ...product });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("dimensions.")) {
      const dimensionName = name.split(".")[1];
      setCurrentProduct((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionName]: value,
        },
      }));
    } else if (name === "tags") {
      setCurrentProduct({
        ...currentProduct,
        tags: value.split(",").map((tag) => tag.trim()),
      });
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: value,
      });
    }
  };

  const handleColorChange = (e, colorIndex) => {
    const { name, value } = e.target;
    const updatedColors = [...currentProduct.colors];
    updatedColors[colorIndex][name] = value;
    setCurrentProduct({ ...currentProduct, colors: updatedColors });
  };

  const handleInventoryChange = (e, colorIndex, size) => {
    const { name, value } = e.target;
    const updatedColors = [...currentProduct.colors];

    if (!updatedColors[colorIndex].sizes_inventory) {
      updatedColors[colorIndex].sizes_inventory = {}; // Ensure sizes_inventory is initialized
    }

    if (!updatedColors[colorIndex].sizes_inventory[size]) {
      updatedColors[colorIndex].sizes_inventory[size] = {
        inventory: 0,
        price: 0,
      };
    }

    updatedColors[colorIndex].sizes_inventory[size][name] = value;
    setCurrentProduct({ ...currentProduct, colors: updatedColors });
  };

  const handleImageUpload = (e, colorIndex) => {
    const files = e.target.files;
    setNewImages({
      ...newImages,
      [colorIndex]: [...(newImages[colorIndex] || []), ...files],
    });
  };

  const uploadColorImages = async (colorIndex) => {
    const colorImages = newImages[colorIndex] || [];
    const color = currentProduct.colors[colorIndex];
    
    // Start with existing images
    const updatedImages = [...(color.images || [])];
  
    // If new images are uploaded, replace or append them
    if (colorImages.length > 0) {
      for (const image of colorImages) {
        const imageRef = ref(storage, `products/${uuidv4()}-${image.name}`);
        await uploadBytes(imageRef, image);
        const downloadUrl = await getDownloadURL(imageRef);
        updatedImages.push(downloadUrl); // Add the new URL to the array
      }
    }
  
    // Return the updated images array
    return updatedImages;
  };
  

  const handleUpdate = async () => {
    setLoading(true);
    setSuccessMessage("");
  
    try {
      const updatedColors = await Promise.all(
        currentProduct.colors.map(async (color, colorIndex) => ({
          ...color,
          images: await uploadColorImages(colorIndex), // Use the updated upload function
        }))
      );
  
      const productDoc = doc(db, "products", currentProduct.id);
      await updateDoc(productDoc, {
        ...currentProduct,
        colors: updatedColors,
      });
  
      setSuccessMessage("Product updated successfully!");
      alert("Product updated successfully!");
      window.location.reload();
      setIsEditing(false);
      setCurrentProduct(null);
      setNewImages({});
    } catch (error) {
      console.error("Error updating product: ", error);
    } finally {
      setLoading(false);
    }
  };
  

  const addColorSection = () => {
    setCurrentProduct({
      ...currentProduct,
      colors: [
        ...currentProduct.colors,
        { color_name: "", hex_code: "", images: [], sizes_inventory: {} },
      ],
    });
  };

  const removeColorSection = (index) => {
    const updatedColors = currentProduct.colors.filter((_, i) => i !== index);
    setCurrentProduct({ ...currentProduct, colors: updatedColors });
  };

  return (
    <div className="max-w-screen-xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Total Product List - {products.length}
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="text-lg text-gray-700">
                {product.name} - {product.price}₹
              </span>
              <div>
                <button
                  onClick={() => handleEdit(product)}
                  className="bg-yellow-500 text-white p-2 rounded-lg mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white p-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="mt-8 h-[90%] w-[90%] overflow-y-auto bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <div className="space-y-4">
              {/* Input fields for editing */}
              <div>
                <label className="block font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentProduct.name || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Product Name"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={currentProduct.description || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Product Description"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={currentProduct.price || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Price"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={currentProduct.sku || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="SKU"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={currentProduct.brand || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Brand"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Date Added
                </label>
                <input
                  type="date"
                  name="date_added"
                  value={currentProduct.date_added?.substring(0, 10) || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={currentProduct.tags.join(", ") || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Tags (comma separated)"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">
                  Dimensions
                </label>
                <div className="flex space-x-2">
                  <label className="block font-medium text-gray-700">
                    Length
                  </label>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={currentProduct.dimensions?.length || ""}
                    onChange={handleInputChange}
                    className="w-1/3 p-2 border rounded-lg"
                    placeholder="Length"
                  />
                  <label className="block font-medium text-gray-700">
                    Width
                  </label>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={currentProduct.dimensions?.width || ""}
                    onChange={handleInputChange}
                    className="w-1/3 p-2 border rounded-lg"
                    placeholder="Width"
                  />
                  <label className="block font-medium text-gray-700">
                    Height
                  </label>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={currentProduct.dimensions?.height || ""}
                    onChange={handleInputChange}
                    className="w-1/3 p-2 border rounded-lg"
                    placeholder="Height"
                  />
                </div>
              </div>

              {currentProduct.colors?.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="mt-4 p-4 bg-white rounded-lg shadow-sm"
                >
                  <h4 className="text-lg font-semibold mb-2">
                    Color: {color.color_name}
                  </h4>
                  <h4 className="text-lg font-semibold mb-2">
                    Hex Code: {color.hex_code}
                  </h4>
                  <div>
                    <label className="block font-medium text-gray-700">
                      Upload New Images (Replaces Previous)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, colorIndex)}
                      className="w-full p-2 border rounded-lg"
                    />
                    <div className="mt-2 flex gap-2">
                      {/* Display existing images */}
                      {color.images?.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Color ${color.color_name}`}
                          className="h-20 w-20 object-contain border"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block font-medium text-gray-700">
                      Color Name
                    </label>
                    <input
                      type="text"
                      name="color_name"
                      value={color.color_name || ""}
                      onChange={(e) => handleColorChange(e, colorIndex)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Color Name"
                    />
                    <label className="block font-medium text-gray-700">
                      Hex Code
                    </label>
                    <input
                      type="text"
                      name="hex_code"
                      value={color.hex_code || ""}
                      onChange={(e) => handleColorChange(e, colorIndex)}
                      className="w-full p-2 border rounded-lg"
                      placeholder="Hex Code"
                    />
                  </div>
                  <div>
                    <h5 className="font-semibold mt-2">Sizes Inventory</h5>
                    {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                      <div
                        key={size}
                        className="flex items-center justify-between mb-2"
                      >
                        <label className="block font-medium text-gray-700">
                          {size}
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            name="inventory"
                            placeholder="Inventory"
                            value={color.sizes_inventory[size]?.inventory || ""}
                            onChange={(e) =>
                              handleInventoryChange(e, colorIndex, size)
                            }
                            className="p-2 border rounded-lg w-24"
                          />
                          <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={color.sizes_inventory[size]?.price || ""}
                            onChange={(e) =>
                              handleInventoryChange(e, colorIndex, size)
                            }
                            className="p-2 border rounded-lg w-24"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delete Color Section Button */}
                  <button
                    onClick={() => removeColorSection(colorIndex)}
                    className="bg-red-500 text-white p-2 rounded-lg mt-4"
                  >
                    Remove Color Section
                  </button>
                </div>
              ))}

              {/* Add Color Section Button */}
              <button
                onClick={addColorSection}
                className="bg-green-500 text-white p-3 mx-2 rounded-lg mt-4"
              >
                Add New Color Section
              </button>

              {/* Save Changes Button */}
              <button
                onClick={() => handleUpdate()}
                className="bg-blue-500 text-white p-3 rounded-lg mt-4"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>

              {successMessage && (
                <p className="text-green-500 mt-4">{successMessage}</p>
              )}
              <button
                onClick={() => {
                  setIsEditing(false);
                  setCurrentProduct(null);
                }}
                className="bg-gray-500 text-white p-3 mx-2 rounded-lg mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductList;
