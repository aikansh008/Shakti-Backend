const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
});

// Storage for files/documents
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-files',
    resource_type: 'auto',
  },
});

// Multer configurations
const uploadImage = multer({ 
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadFile = multer({ 
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Allow documents, audio, video
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/',
      'video/',
      'text/'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadFile
};