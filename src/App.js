// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AddPackage from "./components/AddPackage.js";
import ManageBookings from "./components/ManageBookings";
import ManageCoupons from "./components/ManageCoupons";
import ProductList from "./components/ProductList.js";
import Category from "./components/Category.js";
import ManageOrder from "./components/manageOrder.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-product" element={<AddPackage />} />
        <Route path="/update-product" element={<ProductList />} />
        <Route path="/category" element={<Category />} />
        {/* <Route path="/manage-bookings" element={<ManageBookings />} /> */}
        {/* <Route path="/manage-coupons" element={<ManageCoupons />} /> */}
        <Route path="/manage-orders" element={<ManageOrder />} />
      </Routes>
    </Router>
  );
}

export default App;
