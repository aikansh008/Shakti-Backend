const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();

const requireAuth = require('../Middlewares/authMiddleware');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

// GET route to fetch relevant PDF links from Google Search
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    // Fetch user and language preference
    const user = await PersonalDetails.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lang = user.personalDetails?.Preferred_Languages?.[0] || 'en';

    // Fetch business sector
    const businessData = await BusinessIdeaDetails.findOne({ userId });
    if (
      !businessData ||
      !businessData.ideaDetails ||
      !businessData.ideaDetails.Business_Sector
    ) {
      return res.status(404).json({ error: 'Business sector not found for this user' });
    }

    const query = businessData.ideaDetails.Business_Sector;

    // Search Google Custom Search API for PDFs
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

    // Extract relevant details (only PDF links)
    const pdfLinks = items
      .filter(item => item.link.toLowerCase().endsWith('.pdf'))
      .map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      }));

    return res.json(pdfLinks);
  } catch (error) {
    console.error('PDF search error:', error.message);
    return res.status(500).json({ error: 'Error fetching PDF links' });
  }
});

module.exports = router;
