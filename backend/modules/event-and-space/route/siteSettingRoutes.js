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

// In-memory cache for dynamic CMS content (community, projects)
const cachedContentByKey = new Map();

// GET /api/settings/content/:key - Public endpoint for Community & Projects dynamic data
router.get("/content/:key", async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  const cleanKey = `content_${String(req.params.key || "").toLowerCase().trim()}`;

  if (cachedContentByKey.has(cleanKey)) {
    return res.json({ success: true, data: cachedContentByKey.get(cleanKey) });
  }

  try {
    const setting = await SiteSetting.findOne({ key: cleanKey }).lean();
    const payload = setting?.data || null;
    cachedContentByKey.set(cleanKey, payload);
    res.json({ success: true, data: payload });
  } catch (error) {
    logger.error({ err: error.message, key: cleanKey }, "Error fetching dynamic content");
    res.json({ success: true, data: null });
  }
});

// PUT /api/settings/content/:key - Admin endpoint to update Community or Projects data in DB
router.put("/content/:key", protect, authorize("admin", "super_admin", "branch_admin"), async (req, res) => {
  try {
    const cleanKey = `content_${String(req.params.key || "").toLowerCase().trim()}`;
    const payload = req.body?.data !== undefined ? req.body.data : req.body;

    const setting = await SiteSetting.findOneAndUpdate(
      { key: cleanKey },
      { $set: { key: cleanKey, data: payload } },
      { upsert: true, new: true }
    ).lean();

    cachedContentByKey.set(cleanKey, setting.data);
    logger.info({ key: cleanKey }, "[SETTINGS] Dynamic content updated");

    res.json({
      success: true,
      message: `Content for '${req.params.key}' updated successfully`,
      data: setting.data,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Error updating dynamic content");
    res.status(500).json({ success: false, message: "Failed to update content", error: error.message });
  }
});

module.exports = router;
