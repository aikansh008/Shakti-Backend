const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

// Ensure the downloads folder exists
const downloadDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

async function downloadPDF(pdfUrl, filename) {
  const filePath = path.join(downloadDir, filename);

  const writer = fs.createWriteStream(filePath);
  try {
    const response = await axios({
      url: pdfUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filename));
      writer.on('error', reject);
    });
  } catch (error) {
    writer.close();
    fs.unlinkSync(filePath);
    throw error;
  }
}

router.get('/', async (req, res) => {
  const query = req.query.q;
  const lang = req.query.lang || 'en';

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
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

    const downloadedFiles = [];

    for (const item of items) {
      const url = item.link;
      const filename = path.basename(url.split('?')[0]); // Remove query params
      try {
        await downloadPDF(url, filename);
        downloadedFiles.push({
          title: item.title,
          snippet: item.snippet,
          fileUrl: `/downloads/${filename}` // Accessible path
        });
      } catch (err) {
        console.warn(`Failed to download ${url}`);
      }
    }

    res.json(downloadedFiles);
  } catch (error) {
    console.error('PDF search/download error:', error.message);
    res.status(500).json({ error: 'Error fetching or downloading PDFs' });
  }
});

module.exports = router;
