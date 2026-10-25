const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directories exist
const backendUploadDir = path.join(__dirname, '..', 'public', 'uploads');
const frontendUploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads');
try {
  fs.mkdirSync(backendUploadDir, { recursive: true });
  fs.mkdirSync(frontendUploadDir, { recursive: true });
} catch (e) {}

// Configure Cloudinary SDK
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'eventhub' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Setup Multer Storage (Cloudinary if valid credentials exist, else fast local static uploads)
let storage;
if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const isVideo = file.mimetype.startsWith('video/');
      return {
        folder: 'eventhub_uploads',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo
          ? ['mp4', 'mov', 'avi', 'mkv', 'webm']
          : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: isVideo ? [{ quality: 'auto' }] : [{ width: 1200, crop: 'limit', quality: 'auto' }],
      };
    },
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, backendUploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || '.jpg';
      const fname = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, fname);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max limit for high-def videos
});

module.exports = { cloudinary, upload, isCloudinaryConfigured };

