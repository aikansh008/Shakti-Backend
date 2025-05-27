const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shakti_messages',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'mp4'],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
