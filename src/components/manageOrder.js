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

  // Handle updating the deliveryStatus
  const handleUpdateOrder = async () => {
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

      {selectedOrder && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 h-[80%] w-[80%] rounded-lg shadow-lg    overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Edit Order</h2>

                  <div className="mb-4">
                    <p>
                      <strong>Order ID:</strong> {selectedOrder.id}
                    </p>
                    <p>
                      <strong>Customer Name:</strong> {selectedOrder.name}
                    </p>
                    <p>
                      <strong>Delivery Address:</strong>{" "}
                      {selectedOrder.deliveryAddress}, {selectedOrder.city},{" "}
                      {selectedOrder.state} - {selectedOrder.zipCode}
                    </p>
                    <p>
                      <strong>Phone Number:</strong> {selectedOrder.phoneNumber}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.email}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {selectedOrder.createdAt &&
                        new Date(
                          selectedOrder.createdAt.seconds * 1000
                        ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ${selectedOrder.totalPrice}
                    </p>
                  </div>

                  {/* Delivery Status Edit */}
                  <div className="mb-4">
                    <label className="block mb-1">Delivery Status</label>
                    <input
                      type="text"
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                  </div>

                  {/* Items Section */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <>
                      <h3 className="text-lg font-bold mt-4">Items:</h3>
                      <ul className="list-disc list-inside">
                        {selectedOrder.items.map((item, index) => (
                          <li
                            key={index}
                            className="mb-4 p-2 border rounded-lg shadow-sm bg-gray-50"
                          >
                            <p className="font-semibold">{item.name}</p>
                            <p>
                              <strong>Quantity:</strong> {item.quantity}
                            </p>
                            <p>
                              <strong>Price:</strong> ${item.price}
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
                                        <strong>Color:</strong>{" "}
                                        {color.color_name}
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
                                                    alt={`Image of ${
                                                      color.color_name
                                                    } ${imageIndex + 1}`}
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

                            {/* Dimensions */}
                            {item.dimensions &&
                              typeof item.dimensions === "object" && (
                                <>
                                  <h4 className="font-semibold mt-2">
                                    Dimensions:
                                  </h4>
                                  <p>
                                    <strong>Height:</strong>{" "}
                                    {item.dimensions.height} cm
                                  </p>
                                  <p>
                                    <strong>Width:</strong>{" "}
                                    {item.dimensions.width} cm
                                  </p>
                                  <p>
                                    <strong>Length:</strong>{" "}
                                    {item.dimensions.length} cm
                                  </p>
                                </>
                              )}

                            {/* Tags */}
                            {item.tags &&
                              Array.isArray(item.tags) &&
                              item.tags.length > 0 && (
                                <>
                                  <h4 className="font-semibold mt-2">Tags:</h4>
                                  <ul className="list-disc list-inside">
                                    {item.tags.map((tag, tagIndex) => (
                                      <li key={tagIndex}>{tag}</li>
                                    ))}
                                  </ul>
                                </>
                              )}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-gray-300 text-gray-700 py-1 px-4 rounded mr-2"
                      onClick={() => setSelectedOrder(null)} // Close modal
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-green-500 text-white py-1 px-4 rounded"
                      onClick={handleUpdateOrder}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}

export default ManageOrder;
