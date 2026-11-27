const express = require('express');
const router = express.Router();
const { upload } = require('../../../common/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const logger = require('../../../common/logger');
const path = require('path');

// Safe wrapper for single image upload with error handling
const handleSingleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            logger.error({ err: err.message }, 'Multer single upload error');
            let msg = err.message || 'File upload error';
            if (err.code === 'LIMIT_FILE_SIZE') {
                msg = 'File too large. Maximum supported image size is 10MB.';
            }
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};

// Safe wrapper for array image upload with error handling
const handleArrayUpload = (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            logger.error({ err: err.message }, 'Multer array upload error');
            let msg = err.message || 'Gallery upload error';
            if (err.code === 'LIMIT_FILE_SIZE') {
                msg = 'One or more files are too large. Maximum supported image size is 10MB.';
            }
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};

// Resolve uploaded file URL and public ID across Cloudinary v2/v4 and local disk storage
const resolveUploadedFile = (file) => {
    const remoteUrl = [file.secure_url, file.url, file.path].find(
        (val) => typeof val === 'string' && val.startsWith('http')
    );
    let fileUrl;
    if (remoteUrl) {
        fileUrl = remoteUrl;
    } else {
        fileUrl = `/uploads/${file.filename}`;
    }
    return {
        url: fileUrl,
        publicId: file.public_id || file.filename,
    };
};

// POST /api/upload - Single Image File (Authenticated users only)
router.post('/', protect, handleSingleUpload, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const { url: fileUrl, publicId } = resolveUploadedFile(req.file);

        res.json({
            success: true,
            message: 'Image uploaded successfully!',
            data: {
                url: fileUrl,
                publicId,
                resourceType: 'image',
                format: req.file.format || path.extname(req.file.originalname).slice(1),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
});

// POST /api/upload/gallery - Multiple Image Files Upload (Authenticated users only)
router.post('/gallery', protect, handleArrayUpload, (req, res) => {
    try {
        const uploadedFiles = (req.files || []).map(resolveUploadedFile);

        res.json({
            success: true,
            count: uploadedFiles.length,
            data: uploadedFiles,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gallery upload failed', error: error.message });
    }
});

module.exports = router;
