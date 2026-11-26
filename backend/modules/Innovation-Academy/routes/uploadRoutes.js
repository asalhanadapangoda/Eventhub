import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Cloudinary Configuration with safe persistent defaults
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ogymjek8';
const CLOUD_API_KEY = process.env.CLOUDINARY_API_KEY || '952847967259635';
const CLOUD_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'TOHOi8JQqnB5kwK5H-Q7Swh4Vdc';

const isCloudinaryConfigured = () =>
  Boolean(CLOUD_NAME && CLOUD_API_KEY && CLOUD_API_SECRET);

router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or invalid file type',
    });
  }

  // If Cloudinary is configured, upload to Cloudinary Cloud CDN
  if (isCloudinaryConfigured()) {
    try {
      cloudinary.config({
        cloud_name: CLOUD_NAME,
        api_key: CLOUD_API_KEY,
        api_secret: CLOUD_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'trace_innovation_academy',
        resource_type: 'auto',
      });

      // Remove temporary local file
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupErr) { }

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        filename: result.public_id,
        format: result.format,
        message: 'Image uploaded to Cloudinary successfully',
      });
    } catch (cloudErr) {
      console.warn('[Cloudinary Upload Warning] Fallback to local storage:', cloudErr.message);
    }
  }

  // Fallback to local uploads storage
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    message: 'Image uploaded successfully',
  });
});

export default router;

