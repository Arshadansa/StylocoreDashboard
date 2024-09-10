// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AddPackage from "./components/AddPackage.js";
import ManageBookings from "./components/ManageBookings";
import ManageCoupons from "./components/ManageCoupons";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-package" element={<AddPackage />} />
        <Route path="/manage-bookings" element={<ManageBookings />} />
        <Route path="/manage-coupons" element={<ManageCoupons />} />
      </Routes>
    </Router>
  );
}

export default App;
