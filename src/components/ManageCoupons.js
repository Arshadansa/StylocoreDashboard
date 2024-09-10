import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");

  // Fetch coupons from Firestore
  useEffect(() => {
    const fetchCoupons = async () => {
      const couponsCollection = collection(db, "coupons");
      const couponsSnapshot = await getDocs(couponsCollection);
      const couponsList = couponsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCoupons(couponsList);
    };

    fetchCoupons();
  }, []);

  // Add a new coupon
  const addCoupon = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "coupons"), {
      code: newCoupon,
      discount: Number(discount),
      validUntil: new Date(validUntil),
    });
    setNewCoupon("");
    setDiscount("");
    setValidUntil("");
    alert("Coupon added!");
  };

  // Delete a coupon
  const deleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      await deleteDoc(doc(db, "coupons", id));
      setCoupons(coupons.filter((coupon) => coupon.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-10 text-center">Manage Coupons</h1>

      {/* Add Coupon Form */}
      <form onSubmit={addCoupon} className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Coupon Code</label>
            <input
              type="text"
              placeholder="Coupon Code"
              value={newCoupon}
              onChange={(e) => setNewCoupon(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              placeholder="Discount (%)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Valid Until</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="p-3 border border-gray-800 rounded w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition duration-300"
        >
          Add Coupon
        </button>
      </form>

      {/* Display Coupon List */}
      <h2 className="text-3xl font-semibold mb-5 text-gray-900">Active Coupons</h2>
      <ul>
        {coupons.map((coupon) => (
          <li key={coupon.id} className="mb-4 p-5 bg-white border border-gray-200 shadow-sm rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{coupon.code}</h3>
                <p className="text-gray-700">Discount: {coupon.discount}%</p>
                <p className="text-gray-700">
                  Valid Until: {new Date(coupon.validUntil.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteCoupon(coupon.id)}
                className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageCoupons;
