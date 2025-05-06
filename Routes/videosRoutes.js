// Routes/youtubeSearchRoute.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

// Load from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// GET /api/youtube?q=milk business&lang=hi
router.get('/', async (req, res) => {
  const query = req.query.q;
  const lang = req.query.lang || 'hi'; // default to Hindi

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: query,
        type: 'video',
        regionCode: 'IN',
        relevanceLanguage: lang,
        maxResults: 10
      }
    });

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    res.json(videos);
  } catch (error) {
    console.error('YouTube Search Error:', error.message);
    res.status(500).json({ error: 'Error fetching YouTube results' });
  }
});

module.exports = router;
