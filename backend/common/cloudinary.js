const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;
const multerCloudinary = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Ensure local backend uploads directory exists
const backendUploadDir = path.join(__dirname, '..', 'public', 'uploads');
try {
  fs.mkdirSync(backendUploadDir, { recursive: true });
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

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const ALLOWED_IMAGE_EXTS = /\.(jpe?g|png|webp|gif|avif)$/i;

const buildUploadParams = () => {
  return {
    folder: 'eventhub_uploads',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  };
};

// Setup Multer Storage (Cloudinary if valid credentials exist, else fast local static uploads)
let storage;
if (isCloudinaryConfigured) {
  try {
    const StorageClass =
      multerCloudinary.CloudinaryStorage ||
      (multerCloudinary.default && multerCloudinary.default.CloudinaryStorage);

    if (StorageClass) {
      // multer-storage-cloudinary v4+ class API
      storage = new StorageClass({
        cloudinary: cloudinary,
        params: async (req, file) => buildUploadParams(file),
      });
    } else {
      const storageFactory =
        typeof multerCloudinary === 'function'
          ? multerCloudinary
          : multerCloudinary.default;

      if (typeof storageFactory === 'function') {
        // multer-storage-cloudinary v2.x factory API expects root cloudinary module (.v2) and callback params
        storage = storageFactory({
          cloudinary: cloudinaryModule,
          params: (req, file, cb) => cb(null, buildUploadParams(file)),
        });
      }
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to initialize Cloudinary storage, falling back to local disk storage');
    storage = null;
  }
}

if (!storage) {
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

const imageFileFilter = (req, file, cb) => {
  const mimeOk = Boolean(file.mimetype && ALLOWED_IMAGE_MIMES.has(file.mimetype.toLowerCase()));
  const extOk = Boolean(file.originalname && ALLOWED_IMAGE_EXTS.test(file.originalname));
  if (mimeOk && extOk) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only image files (JPG, PNG, WebP, GIF, AVIF) up to 10MB are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max limit for images
  fileFilter: imageFileFilter,
});

module.exports = { cloudinary, upload, isCloudinaryConfigured };

