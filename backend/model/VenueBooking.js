const mongoose = require("mongoose");

const venueBookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
    },
    venueId: {
      type: String,
      default: "",
    },
    venueName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      default: "TRACE Expert City (Colombo)",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventDate: {
      type: String,
      required: true,
    },
    durationHours: {
      type: Number,
      default: 4,
    },
    guests: {
      type: Number,
      default: 50,
    },
    notes: {
      type: String,
      default: "",
    },
    price: {
      type: String,
      default: "Rs. 25,000 / hr",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Contacted", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// High Performance Query Indexes
venueBookingSchema.index({ email: 1 });
venueBookingSchema.index({ status: 1 });

module.exports = mongoose.model("VenueBooking", venueBookingSchema);
