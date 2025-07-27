const express = require('express');
const router = express.Router();
const { uploadImage, uploadFile } = require('../utils/cloudinary');
const requireAuth = require('../Middlewares/authMiddleware');

// Upload image
router.post('/image', requireAuth, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageData = {
      url: req.file.path,
      originalName: req.file.originalname,
      size: req.file.bytes,
      cloudinaryId: req.file.filename
    };

    res.json({
      success: true,
      image: imageData
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload file/document
router.post('/file', requireAuth, uploadFile.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileData = {
      url: req.file.path,
      originalName: req.file.originalname,
      size: req.file.bytes,
      mimeType: req.file.mimetype,
      cloudinaryId: req.file.filename
    };

    res.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;