import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase"; // Import Firestore and Firebase Storage
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function AddProductForm() {
  const [formData, setFormData] = useState({
    name: "Sample Product",
    description: "This is a sample product description.",
    price: "19.99", // Starting with a string, will be parsed to a float later
    sku: "SKU12345",
    brand: "Sample Brand",
    date_added: new Date().toISOString(), // Sets the current date and time
    colors: [
      {
        color_name: "Red",
        hex_code: "#FF0000",
        images: [], // Initially empty, can be updated with file uploads
        sizes_inventory: {
          XS: { inventory: "10", price: "15.99" },
          S: { inventory: "20", price: "17.99" },
          M: { inventory: "30", price: "19.99" },
          L: { inventory: "25", price: "21.99" },
          XL: { inventory: "15", price: "23.99" },
          XXL: { inventory: "5", price: "25.99" },
          XXXL: { inventory: "", price: "" }, // Empty initial values
        },
      },
    ],
    tags: [], // Example tags
    dimensions: {
      length: "10", // Example dimensions, assuming units are in cm
      width: "20",
      height: "30",
    },
  });
  

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  console.log(categories);

  useEffect(() => {
    // Fetch categories from Firestore and organize them
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "category"));
        const categoriesList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          categoriesList.push(data.name); // Adjust according to your data structure
        });
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle input change for basic product details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    console.log(value);

    setFormData((prevData) => ({
      ...prevData,
      tags: checked
        ? [...prevData.tags, value] // Add category to tags if checked
        : prevData.tags.filter((category) => category !== value), // Remove category if unchecked
    }));
  };

  // Handle color and size changes
  const handleColorChange = (index, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index][field] = value;
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleInventoryChange = (index, size, field, value) => {
    const updatedColors = [...formData.colors];
    updatedColors[index].sizes_inventory[size][field] = value;
    setFormData({ ...formData, colors: updatedColors });
  };

  // Handle file uploads for color images
  const handleImageUpload = async (index, files) => {
    const uploadedImageURLs = [];
    const colorId = `color_${index}_${Date.now()}`; // Unique identifier for each color's images

    for (let file of files) {
      const storageRef = ref(storage, `products/${colorId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedImageURLs.push(downloadURL);
    }

    const updatedColors = [...formData.colors];
    updatedColors[index].images = uploadedImageURLs; // Add the URLs to the color
    setFormData({ ...formData, colors: updatedColors });
  };

  // Add a new color section
  const addColor = () => {
    setFormData({
      ...formData,
      colors: [
        ...formData.colors,
        {
          color_name: "",
          hex_code: "",
          images: [],
          sizes_inventory: {
            XS: { inventory: "", price: "" },
            S: { inventory: "", price: "" },
            M: { inventory: "", price: "" },
            L: { inventory: "", price: "" },
            XL: { inventory: "", price: "" },
            XXL: { inventory: "", price: "" },
            XXXL: { inventory: "", price: "" },
          },
        },
      ],
    });
  };

  // Remove a color section
  const removeColor = (index) => {
    const updatedColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: updatedColors });
  };
  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Dynamic product ID
    const productId = `product_id_${Date.now()}`;
  
    // Parse numeric fields with validation
    const parsedPrice = parseFloat(formData.price);
    const parsedDimensions = {
      length: parseFloat(formData.dimensions.length),
      width: parseFloat(formData.dimensions.width),
      height: parseFloat(formData.dimensions.height),
    };
  
    // Check for valid numeric values
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Invalid price. Please enter a valid number greater than zero.");
      setLoading(false);
      return;
    }
  
    if (
      isNaN(parsedDimensions.length) || parsedDimensions.length <= 0 ||
      isNaN(parsedDimensions.width) || parsedDimensions.width <= 0 ||
      isNaN(parsedDimensions.height) || parsedDimensions.height <= 0
    ) {
      alert("Invalid dimensions. Please enter valid numbers greater than zero.");
      setLoading(false);
      return;
    }
  
    try {
      // Add the form data to Firestore
      await setDoc(doc(db, "products", productId), {
        ...formData,
        price: parsedPrice,
        dimensions: parsedDimensions, // Only save the dimensions object
        tags: formData.tags, // Ensure tags is an array
        date_added: new Date().toISOString(),
      });
  
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product: ", error.message);
      alert("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-8 text-center">
        Add New Product
      </h1>

      <form onSubmit={addProduct}>
        {/* Product Basic Information */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter product name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter product description"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter product price"
          />
        </div>
        {/* SKU, Brand, Weight, Dimensions */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter SKU"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter brand name"
          />
        </div>
        {/* Dimensions */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Dimensions (length x width x height)
          </label>
          <input
            type="number"
            name="length"
            value={formData.length}
            onChange={(e) =>
              setFormData({
                ...formData,
                dimensions: { ...formData.dimensions, length: e.target.value },
              })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter length"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Width
          </label>
          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={(e) =>
              setFormData({
                ...formData,
                dimensions: { ...formData.dimensions, width: e.target.value },
              })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter width"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Height
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={(e) =>
              setFormData({
                ...formData,
                dimensions: { ...formData.dimensions, height: e.target.value },
              })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter height"
          />
        </div>
        {/* Categories */}
        <div className="mb-4">
          <h3 className="text-lg text-black font-bold mb-2">Categories</h3>
          <div className="grid grid-cols-2 gap-4">
            {categories.length > 0 &&
              categories[0].map((category, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category_${category}`}
                    value={category.trim()} // Ensure value has no extra spaces
                    checked={formData.tags.includes(category.trim())} // Checked state based on formData.tags
                    onChange={handleCategoryChange} // Trigger the handleCategoryChange function
                    className="mr-2"
                  />
                  <label
                    htmlFor={`category_${category}`}
                    className="text-gray-700"
                  >
                    {category.trim()}{" "}
                    {/* Trim category name to avoid extra spaces */}
                  </label>
                </div>
              ))}
          </div>
        </div>
        {/* Colors */}
        {formData.colors.map((color, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-300 rounded">
            <button
              type="button"
              onClick={() => removeColor(index)}
              className="text-red-600 hover:underline mb-4"
            >
              Remove Color
            </button>

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Color Name
            </label>
            <input
              type="text"
              value={color.color_name}
              onChange={(e) =>
                handleColorChange(index, "color_name", e.target.value)
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter color name"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Hex Code
            </label>
            <input
              type="text"
              value={color.hex_code}
              onChange={(e) =>
                handleColorChange(index, "hex_code", e.target.value)
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter hex color code"
            />

            <label className="block text-gray-700 text-sm font-bold mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                handleImageUpload(index, Array.from(e.target.files))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />

            <div className="grid grid-cols-3 gap-4 mt-2">
              {color.images.map((image, i) => (
                <img
                  key={i}
                  src={image}
                  alt={`Color ${index} image ${i}`}
                  className="w-full h-32 object-cover"
                />
              ))}
            </div>

            {/* Sizes */}
            <div className="mt-4">
              <h4 className="text-md font-bold mb-2">Sizes</h4>
              <div className="grid grid-cols-2 gap-4">
                {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                  <div key={size} className="mb-2">
                    <input
                      type="checkbox"
                      id={`size_${size}_${index}`}
                      checked={color.sizes_inventory[size] ? true : false}
                      onChange={(e) => {
                        const updatedColors = [...formData.colors];
                        if (e.target.checked) {
                          updatedColors[index].sizes_inventory[size] = {
                            inventory: "",
                            price: "",
                          };
                        } else {
                          delete updatedColors[index].sizes_inventory[size];
                        }
                        setFormData({ ...formData, colors: updatedColors });
                      }}
                    />
                    <label
                      htmlFor={`size_${size}_${index}`}
                      className="ml-2 text-gray-700"
                    >
                      {size}
                    </label>

                    {color.sizes_inventory[size] && (
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Inventory
                          </label>
                          <input
                            type="number"
                            value={color.sizes_inventory[size].inventory}
                            onChange={(e) =>
                              handleInventoryChange(
                                index,
                                size,
                                "inventory",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder="Enter inventory"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Price
                          </label>
                          <input
                            type="number"
                            value={color.sizes_inventory[size].price}
                            onChange={(e) =>
                              handleInventoryChange(
                                index,
                                size,
                                "price",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            placeholder="Enter price"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="w-full bg-gray-600 text-white px-4 py-2 rounded mb-4"
          onClick={addColor}
        >
          Add Another Color
        </button>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProductForm;
