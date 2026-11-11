const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      default: "TRACE Expert City (Colombo)",
      trim: true,
    },
    province: {
      type: String,
      default: "Western Province",
      trim: true,
    },
    city: {
      type: String,
      default: "Colombo, Sri Lanka",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: 100,
    },
    rentalPrice: {
      type: String,
      default: "Rs. 25,000 / hr",
      trim: true,
    },
    pricePerHour: {
      type: Number,
      default: 25000,
    },
    isOnDemand: {
      type: Boolean,
      default: false,
    },
    includeTax: {
      type: Boolean,
      default: false,
    },
    taxLabelType: {
      type: String,
      default: "+ Tax",
    },
    status: {
      type: String,
      enum: ["Available", "Reserved", "Under Maintenance"],
      default: "Available",
    },
    type: {
      type: String,
      default: "Meeting Room",
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: ["High-Speed WiFi", "Air Conditioned", "4K AV Display"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// High Performance Query Indexes
venueSchema.index({ branch: 1, province: 1 });
venueSchema.index({ status: 1 });
venueSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Venue", venueSchema);
