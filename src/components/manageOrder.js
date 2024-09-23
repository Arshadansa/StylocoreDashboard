import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Import your Firestore instance

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // For the popup/modal
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      const ordersCollection = collection(db, "orders");
      const orderSnapshot = await getDocs(ordersCollection);
      const orderList = orderSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderList);
      setFilteredOrders(orderList); // Initialize filteredOrders with all orders
    };

    fetchOrders();
  }, []);

  // Handle "View Details" click
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDeliveryStatus(order.deliveryStatus);
  };

  // Handle updating the deliveryStatus and other editable fields
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    const orderDoc = doc(db, "orders", selectedOrder.id);
    await updateDoc(orderDoc, {
      deliveryStatus: deliveryStatus,
    });
    alert("Order updated successfully!");

    // Close modal and refresh orders
    setSelectedOrder(null);
  };

  // Handle search functionality
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.name.toLowerCase().includes(searchTerm)
    );
    setFilteredOrders(filtered);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl text-center font-bold mb-4">Manage Orders</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by Order ID or Product Name"
        value={searchTerm}
        onChange={handleSearch}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Order list in a grid with 5 columns */}
      <div className="grid grid-cols-1 max-w-screen-xl mx-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border text-black p-2 py-4 rounded-lg shadow-lg"
          >
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Product Name:</strong> {order.name}
            </p>
            <p>
              <strong>Delivery Status:</strong> {order.deliveryStatus}
            </p>
            <button
              className="mt-2 bg-blue-500 text-white py-1 px-3 rounded"
              onClick={() => handleViewDetails(order)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Modal for order details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 h-[80%] w-[80%] rounded-lg shadow-lg overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            {/* Form for all fields */}
            <form onSubmit={handleUpdateOrder}>
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold">Order ID</label>
                  <input
                    type="text"
                    value={selectedOrder.id}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">Customer Name</label>
                  <input
                    type="text"
                    value={selectedOrder.name}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">Email</label>
                  <input
                    type="email"
                    value={selectedOrder.email}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={selectedOrder.phoneNumber}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold">Delivery Address</label>
                  <input
                    type="text"
                    value={selectedOrder.deliveryAddress}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">City</label>
                  <input
                    type="text"
                    value={selectedOrder.city}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">State</label>
                  <input
                    type="text"
                    value={selectedOrder.state}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block font-bold">Zip Code</label>
                  <input
                    type="text"
                    value={selectedOrder.zipCode}
                    readOnly
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>
              </div>

              {/* Editable Delivery Status */}
              <div className="mb-4">
                <label className="block font-bold">Delivery Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Order Items */}
              {selectedOrder.items && (
                <>
                  <h3 className="text-lg font-bold mt-4">Items:</h3>
                  <ul className="list-disc  list-inside mb-4">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index} className="border bg-gray-100 p-2 rounded mb-2">
                        <p>
                          <strong>Item Name:</strong> {item.name}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>Brand:</strong> {item.brand}
                        </p>
                        <p>
                          <strong>Description:</strong> {item.description}
                        </p>

                        {/* Sizes Inventory */}
                        {item.sizes_inventory &&
                          typeof item.sizes_inventory === "object" && (
                            <div className="mt-2">
                              <h4 className="font-semibold">Sizes:</h4>
                              <ul className="list-disc list-inside">
                                {Object.entries(item.sizes_inventory).map(
                                  ([size, details]) => (
                                    <li key={size}>
                                      <strong>Size:</strong> {size} -{" "}
                                      <strong>Inventory:</strong>{" "}
                                      {details.inventory} -{" "}
                                      <strong>Price:</strong> $
                                      {details.price}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                        {/* Colors */}
                        {item.colors &&
                          Array.isArray(item.colors) &&
                          item.colors.length > 0 && (
                            <>
                              <h4 className="font-semibold mt-2">
                                Available Colors:
                              </h4>
                              {item.colors.map((color, colorIndex) => (
                                <div key={colorIndex} className="mt-2">
                                  <p>
                                    <strong>Color:</strong> {color.color_name}
                                  </p>
                                  {color.images &&
                                    Array.isArray(color.images) &&
                                    color.images.length > 0 && (
                                      <>
                                        <h5 className="font-semibold">
                                          Images:
                                        </h5>
                                        <div className="flex space-x-2 overflow-x-auto">
                                          {color.images.map(
                                            (image, imageIndex) => (
                                              <img
                                                key={imageIndex}
                                                src={image}
                                                alt={`Image of ${color.color_name} ${imageIndex + 1}`}
                                                className="w-24 h-24 object-contain rounded border"
                                                onError={(e) => {
                                                  e.target.onerror = null;
                                                  e.target.src =
                                                    "fallback-image-url.jpg"; // Replace with your fallback image URL
                                                }}
                                              />
                                            )
                                          )}
                                        </div>
                                      </>
                                    )}
                                </div>
                              ))}
                            </>
                          )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 py-1 px-4 rounded mr-2"
                  onClick={() => setSelectedOrder(null)} // Close modal
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white py-1 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrder;