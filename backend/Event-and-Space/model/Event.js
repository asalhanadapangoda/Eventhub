const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "past", "draft"],
      default: "upcoming",
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    createdBy: {
      type: String,
      default: "Community User",
    },
    gallery: [
      new mongoose.Schema(
        {
          _id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
          },
          url: {
            type: String,
            default: "",
          },
          caption: {
            type: String,
            default: "",
          },
        },
        { _id: false }
      ),
    ],
    highlights: [String],
    speaker: {
      name: String,
      role: String,
      bio: String,
      avatar: String,
    },
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// High Performance Query Indexes
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model("Event", eventSchema);
