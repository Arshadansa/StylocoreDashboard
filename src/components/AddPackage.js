import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";

function AddPackage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [nights, setNights] = useState("");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [rating, setRating] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [packages, setPackages] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // For the image upload popup
  const [uploadedImages, setUploadedImages] = useState([]); // To store uploaded images
  const [selectedImages, setSelectedImages] = useState([]); // Images selected from gallery
  const [errorMessage, setErrorMessage] = useState("");
  const [isModifyPopupOpen, setIsModifyPopupOpen] = useState(false); // Popup for modifying packages
  const [editingPackage, setEditingPackage] = useState(null); // The package being edited

  // Fetch existing packages from Firestore
  useEffect(() => {
    const fetchPackages = async () => {
      const querySnapshot = await getDocs(collection(db, "packages"));
      const fetchedPackages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPackages(fetchedPackages);
    };

    fetchPackages();
  }, []);

  // Fetch images from Firebase Storage
  useEffect(() => {
    const fetchUploadedImages = async () => {
      const listRef = ref(storage, "uploadedImages/");
      const res = await listAll(listRef);
      const urls = await Promise.all(
        res.items.map((itemRef) => getDownloadURL(itemRef))
      );
      setUploadedImages(urls);
    };

    fetchUploadedImages();
  }, []);

  // Handle image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `uploadedImages/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedImages((prevImages) => [...prevImages, downloadURL]);
      }
    );
  };

  // Open image upload popup
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  // Close image upload popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Handle selecting images from the gallery
  const handleImageSelect = (image) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(selectedImages.filter((img) => img !== image));
    } else if (selectedImages.length < 5) {
      setSelectedImages([...selectedImages, image]);
    } else {
      setErrorMessage("You can select up to 5 images.");
    }
  };

  // Submit selected images for the package
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length < 3 || selectedImages.length > 5) {
      setErrorMessage("Please select between 3 and 5 images.");
      return;
    }

    try {
      const packageRef = await addDoc(collection(db, "packages"), {
        title,
        location,
        category,
        price,
        days,
        nights,
        description,
        startDate,
        endDate,
        mapLink,
        rating,
        images: selectedImages,
      });

      alert("Package added successfully!");
    } catch (error) {
      console.error("Error adding package: ", error);
    }
  };

  // Open the modify popup for a package
  const handleModify = (packageData) => {
    setEditingPackage(packageData);
    setIsModifyPopupOpen(true);
  };

  // Handle update on package modification
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const packageDocRef = doc(db, "packages", editingPackage.id);
      await updateDoc(packageDocRef, editingPackage);
      setIsModifyPopupOpen(false);
      alert("Package updated successfully!");
    } catch (error) {
      console.error("Error updating package: ", error);
    }
  };

  // Delete a package
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      await deleteDoc(doc(db, "packages", id));
      setPackages(packages.filter((pkg) => pkg.id !== id));
      alert("Package deleted successfully!");
    }
  };

  // Handle changes in the modify popup form
  const handleChange = (e) => {
    setEditingPackage({
      ...editingPackage,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-8 text-center">Add New Tour Package</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input
            type="text"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="text"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Price per person"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Nights"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
          />
          <input
            type="number"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <input
            type="url"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Map Link"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
          />
          <input
            type="date"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            type="button"
            onClick={handleOpenPopup}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300"
          >
            Upload Images
          </button>

          <textarea
            className="p-3 border border-gray-800 rounded w-full"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {errorMessage && <p className="text-red-500 mt-3">{errorMessage}</p>}
        <button type="submit" className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300">
          Add Package
        </button>
      </form>

      {/* Popup for uploading and selecting images */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-2/3">
            <h2 className="text-xl font-bold mb-4">Upload and Select Images</h2>

            <input
              type="file"
              className="mb-4"
              onChange={handleImageUpload}
              accept="image/*"
            />
            <p>Upload progress: {uploadProgress}%</p>

            <h3 className="text-lg font-bold mt-4">Gallery</h3>
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((image, idx) => (
                <div
                  key={idx}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedImages.includes(image) ? "border-black" : "border-gray-300"
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img src={image} alt="uploaded" className="w-full h-32 object-cover" />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClosePopup}
                className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table for Existing Packages */}
      <div className="mt-10">
        <h2 className="text-3xl font-semibold mb-5 text-gray-900">Existing Packages</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-800 p-3">Title</th>
              <th className="border border-gray-800 p-3">Location</th>
              <th className="border border-gray-800 p-3">Price</th>
              <th className="border border-gray-800 p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="border border-gray-800 p-3">{pkg.title}</td>
                <td className="border border-gray-800 p-3">{pkg.location}</td>
                <td className="border border-gray-800 p-3">{pkg.price}</td>
                <td className="border border-gray-800 p-3">
                  <button
                    onClick={() => handleModify(pkg)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition duration-300 mr-2"
                  >
                    Modify
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup for modifying package */}
      {isModifyPopupOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Modify Package</h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="title"
                className="p-3 border border-gray-800 rounded w-full mb-3"
                placeholder="Title"
                value={editingPackage.title}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location"
                className="p-3 border border-gray-800 rounded w-full mb-3"
                placeholder="Location"
                value={editingPackage.location}
                onChange={handleChange}
              />
              <input
                type="number"
                name="price"
                className="p-3 border border-gray-800 rounded w-full mb-3"
                placeholder="Price"
                value={editingPackage.price}
                onChange={handleChange}
              />
              <textarea
                name="description"
                className="p-3 border border-gray-800 rounded w-full mb-3"
                placeholder="Description"
                value={editingPackage.description}
                onChange={handleChange}
              />
              <div className="flex justify-end">
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition duration-300">
                  Update Package
                </button>
                <button
                  onClick={() => setIsModifyPopupOpen(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 ml-3 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPackage;
