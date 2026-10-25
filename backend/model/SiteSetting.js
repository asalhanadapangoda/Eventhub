const mongoose = require("mongoose");

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "hero_settings",
    },
    heroMediaType: {
      type: String,
      enum: ["default", "image", "video"],
      default: "default",
    },
    heroImageUrl: {
      type: String,
      default: "",
    },
    heroImages: {
      type: [String],
      default: [],
    },
    heroVideoUrl: {
      type: String,
      default: "",
    },
    heroBadge: {
      type: String,
      default: "TRACE COMMUNITY HUB, SRI LANKA",
    },
    heroTitle: {
      type: String,
      default: "Where innovation meets community and culture.",
    },
    heroSubtitle: {
      type: String,
      default:
        "From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSetting", siteSettingSchema);
