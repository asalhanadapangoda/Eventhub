const express = require("express");
const router = express.Router();
const {
  getAllVenueBookings,
  getUserVenueBookings,
  createVenueBooking,
  updateVenueBookingStatus,
  deleteVenueBooking,
} = require("../controlers/venueBookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

// GET all venue booking inquiries (Admin)
router.get("/", protect, authorize("admin", "super_admin", "branch_admin"), getAllVenueBookings);

// GET venue bookings for user by email
router.get("/user/:email", protect, getUserVenueBookings);

// POST new venue booking inquiry
router.post("/", createVenueBooking);

// PUT update venue booking status (Admin)
router.put("/:id", protect, authorize("admin", "super_admin", "branch_admin"), updateVenueBookingStatus);

// DELETE venue booking inquiry (Admin)
router.delete("/:id", protect, authorize("admin", "super_admin", "branch_admin"), deleteVenueBooking);

module.exports = router;
