const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const requireAuth = require('../Middlewares/authMiddleware'); // import middleware
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const PersonalDetails = require('../Models/PersonalDetailSignup');

const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

// Protected route
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId; 
   const user = await PersonalDetails.findById(userId);// this comes from the middleware
  const lang = user.personalDetails.Preferred_Languages[0] || 'en'; // 

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }

    const businessData = await BusinessIdeaDetails.findOne({ userId });

    if (
      !businessData ||
      !businessData.ideaDetails ||
      !businessData.ideaDetails.Business_Sector
    ) {
      return res.status(404).json({ error: 'Business sector not found for this user' });
    }

    const businessSector = businessData.ideaDetails.Business_Sector;
    const langRestrict = `lang_${lang}`;

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${businessSector} site:.in`,
        gl: 'IN',
        hl: lang,
        lr: langRestrict
      }
    });

    const results = (response.data.items || []).slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    res.json({
      businessSector,
      results
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Error fetching search results' });
  }
});

module.exports = router;
