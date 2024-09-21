import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

function Category() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [editedCategory, setEditedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "category");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCategories(categoryList);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // Create a new collection if it doesn't exist and add the category
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) {
      alert("Category name cannot be empty");
      return;
    }

    if (categories.length === 0) {
      // Create a new document with the category if no document exists
      const docRef = await addDoc(collection(db, "category"), {
        name: [newCategory], // Initializing with the new category
      });
      setCategories([{ id: docRef.id, name: [newCategory] }]);
    } else {
      // Add new category to the existing document
      const categoryDoc = categories[0]; // Assuming there's only one document for categories
      const updatedNames = [...categoryDoc.name, newCategory];

      await updateDoc(doc(db, "category", categoryDoc.id), {
        name: updatedNames,
      });

      setCategories((prev) =>
        prev.map((item) =>
          item.id === categoryDoc.id ? { ...item, name: updatedNames } : item
        )
      );
    }

    setNewCategory("");
    alert("Category added!");
  };

  // Edit a category in the array
  const saveEditedCategory = async (index) => {
    if (editedCategory.trim() === "") {
      alert("Category name cannot be empty");
      return;
    }

    const categoryDoc = categories[0]; // Assuming there's only one document for categories
    const updatedNames = [...categoryDoc.name];
    updatedNames[index] = editedCategory;

    await updateDoc(doc(db, "category", categoryDoc.id), {
      name: updatedNames,
    });

    setCategories((prev) =>
      prev.map((item) =>
        item.id === categoryDoc.id ? { ...item, name: updatedNames } : item
      )
    );

    setEditCategoryIndex(null);
    setEditedCategory("");
    alert("Category updated!");
  };

  // Delete a category from the array
  const deleteCategory = async (categoryName) => {
    const categoryDoc = categories[0]; // Assuming there's only one document for categories
    if (!categoryDoc.name) return;

    const updatedNames = categoryDoc.name.filter((name) => name !== categoryName);

    await updateDoc(doc(db, "category", categoryDoc.id), {
      name: updatedNames,
    });

    setCategories((prev) =>
      prev.map((item) =>
        item.id === categoryDoc.id ? { ...item, name: updatedNames } : item
      )
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-10 text-center">Manage Categories</h1>

      {/* Add Category Form */}
      <form onSubmit={addCategory} className="mb-10">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Category Name</label>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300"
        >
          Add Category
        </button>
      </form>

      {/* Display Category List */}
      <h2 className="text-3xl font-semibold mb-5 text-gray-900">Categories</h2>
      {categories.length > 0 && categories[0].name ? (
        <ul>
          {categories[0].name.map((category, index) => (
            <li key={index} className="mb-4 p-5 bg-white border border-gray-200 shadow-sm rounded-lg">
              <div className="flex justify-between items-center">
                {editCategoryIndex === index ? (
                  <input
                    type="text"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="p-2 border border-gray-800 rounded w-3/4"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                )}

                <div className="flex space-x-2">
                  {editCategoryIndex === index ? (
                    <>
                      <button
                        onClick={() => saveEditedCategory(index)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditCategoryIndex(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditCategoryIndex(index);
                          setEditedCategory(category);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No categories found</p>
      )}
    </div>
  );
}

export default Category;
