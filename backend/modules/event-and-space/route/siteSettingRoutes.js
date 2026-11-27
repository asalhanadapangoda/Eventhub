const express = require("express");
const router = express.Router();
const SiteSetting = require("../model/SiteSetting");
const { protect, authorize } = require("../middleware/authMiddleware");
const logger = require("../../../common/logger");

// Default Fallback Hero Configuration (Exact original video & text)
const DEFAULT_HERO_SETTINGS = {
  key: "hero_settings",
  heroMediaType: "default",
  heroImageUrl: "",
  heroImages: [],
  heroVideoUrl: "",
  heroBadge: "TRACE COMMUNITY HUB, SRI LANKA",
  heroTitle: "Where innovation meets community and culture.",
  heroSubtitle:
    "Be part of Sri Lanka's largest innovation ecosystem to make an impact.",
};

// In-memory cache for 0ms response time
let cachedHeroSettings = null;

// GET /api/settings/hero - Public endpoint for frontend HeroSection
router.get("/hero", async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

  if (cachedHeroSettings) {
    return res.json({ success: true, data: cachedHeroSettings });
  }

  try {
    let setting = await SiteSetting.findOne({ key: "hero_settings" }).lean();
    if (!setting) {
      setting = DEFAULT_HERO_SETTINGS;
    }
    cachedHeroSettings = setting;
    res.json({ success: true, data: setting });
  } catch (error) {
    logger.error({ err: error.message }, "Error fetching hero settings");
    res.json({ success: true, data: cachedHeroSettings || DEFAULT_HERO_SETTINGS });
  }
});

// PUT /api/settings/hero - Admin endpoint to update hero media & banner
router.put("/hero", protect, authorize("admin", "super_admin", "branch_admin"), async (req, res) => {
  try {
    const { heroMediaType, heroImageUrl, heroImages, heroVideoUrl, heroBadge, heroTitle, heroSubtitle } = req.body;

    let setting = await SiteSetting.findOne({ key: "hero_settings" });
    if (!setting) {
      setting = new SiteSetting({ key: "hero_settings" });
    }

    if (heroMediaType !== undefined) setting.heroMediaType = heroMediaType;
    if (heroImageUrl !== undefined) setting.heroImageUrl = heroImageUrl;
    if (heroImages !== undefined) {
      setting.heroImages = Array.isArray(heroImages) ? heroImages.filter(Boolean).slice(0, 10) : [];
      if (setting.heroImages.length > 0 && !setting.heroImageUrl) {
        setting.heroImageUrl = setting.heroImages[0];
      }
    }
    if (heroVideoUrl !== undefined) setting.heroVideoUrl = heroVideoUrl;
    if (heroBadge !== undefined) setting.heroBadge = heroBadge;
    if (heroTitle !== undefined) setting.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) setting.heroSubtitle = heroSubtitle;

    await setting.save();
    cachedHeroSettings = setting.toObject ? setting.toObject() : setting;

    logger.info(
      {
        mediaType: setting.heroMediaType,
        imagesCount: setting.heroImages ? setting.heroImages.length : 0,
        videoUrl: setting.heroVideoUrl,
      },
      "[SETTINGS] Hero settings updated"
    );

    res.json({
      success: true,
      message: "Hero section settings updated successfully!",
      data: setting,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Error updating hero settings");
    res.status(500).json({ success: false, message: "Failed to update hero settings", error: error.message });
  }
});

module.exports = router;
