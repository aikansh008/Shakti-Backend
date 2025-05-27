// Routes/youtubeSearchRoute.js

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
require('dotenv').config();

// Import models and middleware
const requireAuth = require('../Middlewares/authMiddleware');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');

// Load from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// GET /api/youtube
router.get('/', requireAuth, async (req, res) => {
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    const user = await PersonalDetails.findById(userId);
    
    // Validate and sanitize the language code
    let lang = 'en';
    if (
      user?.personalDetails?.Preferred_Languages?.length > 0 &&
      /^[a-z]{2}$/.test(user.personalDetails.Preferred_Languages[0].toLowerCase())
    ) {
      lang = user.personalDetails.Preferred_Languages[0].toLowerCase();
    }

    const businessData = await BusinessIdeaDetails.findOne({ userId });

    if (
      !businessData ||
      !businessData.ideaDetails ||
      !businessData.ideaDetails.Business_Sector ||
      !businessData.ideaDetails.Business_Location
    ) {
      return res.status(404).json({ error: 'Business details not found for this user' });
    }

    const businessSector = businessData.ideaDetails.Business_Sector;

    // Build query params
    const params = {
      key: YOUTUBE_API_KEY,
      part: 'snippet',
      q: `${businessSector} in India`,
      type: 'video',
      regionCode: 'IN',
      maxResults: 10,
    };

    // Only add relevanceLanguage if valid
    if (lang) {
      params.relevanceLanguage = lang;
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json(videos);
  } catch (error) {
    console.error('YouTube Search Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error fetching YouTube results',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
