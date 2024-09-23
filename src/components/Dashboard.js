import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const adminEmail = "admin@Stylocore.com";
  const adminPassword = "Stylocore@123";

  // Check localStorage to see if the user is already logged in
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    } else {
      setShowLogin(true); // Show login popup if not logged in
    }
  }, []);

  // Handle the login process
  const handleLogin = () => {
    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setShowLogin(false);
      alert("Welcome Admin!");
    } else {
      alert("Invalid email or password");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-10 text-center">
        Stylocore Dashboard
      </h1>

      {/* Login Popup */}
      {showLogin && !isLoggedIn && (
        <div className="fixed inset-0 bg-gray-600 p-3 md:p-0 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg md:w-1/3 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full mb-4"
            />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full mb-4"
            />
            <button
              onClick={handleLogin}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition duration-300 w-full"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Show Dashboard if logged in */}
      {isLoggedIn && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Link
              to="/add-product"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Add New Products
            </Link>
            <Link
              to="/update-product"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Update Products
            </Link>
            <Link
              to="/category"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Add Category
            </Link>
            <Link
              to="/manage-orders"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Manage Order
            </Link>
            {/* <Link
              to="/manage-bookings"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Manage Bookings
            </Link> */}

            {/* <Link
              to="/manage-coupons"
              className="border border-gray-800 text-gray-800 p-6 rounded-lg text-center transition-transform transform hover:scale-105 hover:bg-gray-800 hover:text-white"
            >
              Manage Coupons
            </Link> */}
          </div>

          {/* Logout button */}
          <div className="mt-10 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
