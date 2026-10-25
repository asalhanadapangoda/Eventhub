const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../model/User');

const path = require('path');
const fs = require('fs');

// Helper to copy uploaded file to frontend public folder so Vite dev server also serves it immediately
const copyToFrontend = (filename) => {
    try {
        const src = path.join(__dirname, '..', 'public', 'uploads', filename);
        const dest = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads', filename);
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
        }
    } catch (e) {}
};

// Optional auth: if token is supplied and valid, attaches user; does NOT block upload if token is absent/expired
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length > 1 && parts[1] && parts[1] !== "null" && parts[1] !== "undefined") {
            token = parts[1];
        }
    }
    if (token) {
        try {
            const decoded = verifyToken(token);
            if (decoded && decoded.id) {
                const user = await User.findById(decoded.id).select("-password");
                if (user) req.user = user;
            }
        } catch (e) {}
    }
    next();
};

// Safe wrapper for single file upload with error handling
const handleSingleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer single upload error:', err);
            let msg = err.message || 'File upload error';
            if (err.code === 'LIMIT_FILE_SIZE') {
                msg = 'File too large. Maximum supported file/video size is 500MB.';
            }
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};

// Safe wrapper for array upload with error handling
const handleArrayUpload = (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            console.error('Multer array upload error:', err);
            let msg = err.message || 'Gallery upload error';
            if (err.code === 'LIMIT_FILE_SIZE') {
                msg = 'One or more files are too large. Maximum supported file size is 500MB.';
            }
            return res.status(400).json({ success: false, message: msg });
        }
        next();
    });
};

// POST /api/upload - Single File (Image or Video)
router.post('/', optionalAuth, handleSingleUpload, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }

        let fileUrl;
        if (req.file.path && req.file.path.startsWith('http')) {
            fileUrl = req.file.path; // Cloudinary CDN URL
        } else {
            fileUrl = `/uploads/${req.file.filename}`;
            copyToFrontend(req.file.filename);
        }

        res.json({
            success: true,
            message: 'File uploaded successfully!',
            data: {
                url: fileUrl,
                publicId: req.file.filename,
                resourceType: req.file.mimetype ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image') : 'image',
                format: req.file.format || path.extname(req.file.originalname).slice(1),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
    }
});

// POST /api/upload/gallery - Multiple Files Upload
router.post('/gallery', optionalAuth, handleArrayUpload, (req, res) => {
    try {
        const uploadedFiles = (req.files || []).map((file) => {
            let fileUrl;
            if (file.path && file.path.startsWith('http')) {
                fileUrl = file.path;
            } else {
                fileUrl = `/uploads/${file.filename}`;
                copyToFrontend(file.filename);
            }
            return {
                url: fileUrl,
                publicId: file.filename,
            };
        });

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
