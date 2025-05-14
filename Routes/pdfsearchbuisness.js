const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');
const requireAuth = require('../Middlewares/authMiddleware');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

const downloadDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

// Downloads the PDF file locally
async function downloadPDF(pdfUrl, filename) {
  const filePath = path.join(downloadDir, filename);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url: pdfUrl,
    method: 'GET',
    responseType: 'stream',
    timeout: 10000
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

// Uploads a file to Cloudinary
async function uploadToCloudinary(filePath, filename) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      public_id: `pdfs/${filename}`,
      folder: 'pdfs'
    });
    fs.unlinkSync(filePath); // remove local file after upload
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error;
  }
}

// GET route to fetch and upload PDFs
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    const user = await PersonalDetails.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lang = user.personalDetails?.Preferred_Languages?.[0] || 'en';

    const businessData = await BusinessIdeaDetails.findOne({ userId });
    if (
      !businessData ||
      !businessData.ideaDetails ||
      !businessData.ideaDetails.Business_Sector
    ) {
      return res.status(404).json({ error: 'Business sector not found for this user' });
    }

    const query = businessData.ideaDetails.Business_Sector;

    const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${query} filetype:pdf`,
        gl: 'IN',
        hl: lang,
        lr: `lang_${lang}`
      }
    });

    const items = searchResponse.data.items || [];
    const uploadedFiles = [];

    for (const item of items) {
      const url = item.link;
      const filename = path.basename(url.split('?')[0]);
      const uniqueFilename = `${Date.now()}_${filename}`;

      try {
        const filePath = await downloadPDF(url, uniqueFilename);
        const cloudinaryUrl = await uploadToCloudinary(filePath, uniqueFilename);

        uploadedFiles.push({
          title: item.title,
          snippet: item.snippet,
          fileUrl: cloudinaryUrl
        });
      } catch (err) {
        console.warn(`Failed to process ${url}:`, err.message);
      }
    }

    res.json(uploadedFiles);
  } catch (error) {
    console.error('PDF search/upload error:', error.message);
    res.status(500).json({ error: 'Error fetching or uploading PDFs' });
  }
});


module.exports = router;
