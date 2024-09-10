import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);

  // Fetch bookings from Firestore
  useEffect(() => {
    const fetchBookings = async () => {
      const bookingsCollection = collection(db, "bookings");
      const bookingsSnapshot = await getDocs(bookingsCollection);
      const bookingsList = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsList);
    };

    fetchBookings();
  }, []);

  // Handle booking cancellation
  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await deleteDoc(doc(db, "bookings", id));
      setBookings(bookings.filter((booking) => booking.id !== id));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-semibold text-gray-900 mb-8 text-center">Manage Bookings</h1>

      {/* Show the total number of bookings */}
      {bookings.length > 0 ? (
        <>
          <p className="text-lg mb-5 text-gray-800">Total Bookings: {bookings.length}</p>
          <ul className="space-y-5">
            {bookings.map((booking) => (
              <li key={booking.id} className="border border-gray-200 bg-white shadow-sm p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{booking.title}</h2>
                    <p className="text-gray-700">{booking.location}</p>
                  </div>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg transition duration-300"
                  >
                    Cancel Booking
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-500 text-center mt-10">No bookings available at the moment.</p>
      )}
    </div>
  );
}

export default ManageBookings;
