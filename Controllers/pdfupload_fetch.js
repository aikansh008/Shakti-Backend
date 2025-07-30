const express = require('express');
const router = express.Router();
const SearchResult = require('../Models/pdflinks'); // Adjust path as needed
const requireAuth = require('../Middlewares/authMiddleware'); // Optional if you have auth

// Save a new search result
router.post('/save-result', requireAuth, async (req, res) => {
  try {
    const { title, snippet, link, source } = req.body;

    if (!title || !snippet || !link) {
      return res.status(400).json({ error: 'Title, snippet, and link are required.' });
    }

    // Optional auto-categorization
    function classifyCategory(title) {
      title = title.toLowerCase();
      if (title.includes("report")) return "report";
      if (title.includes("study") || title.includes("research")) return "study";
      if (title.includes("draft")) return "draft";
      if (title.includes("ban")) return "ban";
      if (title.includes("outlook")) return "outlook";
      if (title.includes("waste") || title.includes("pollution")) return "waste";
      return "other";
    }

    const category = classifyCategory(title);

    const newResult = new SearchResult({
      userId: req.userId,// from requireAuth middleware
      title,
      snippet,
      link,
      category,
      source: source || 'unknown',
    });

    await newResult.save();
    res.status(201).json({ message: 'Search result saved successfully', data: newResult });

  } catch (error) {
    console.error('Error saving search result:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Optionally: Fetch all results by user
router.get('/my-results', requireAuth, async (req, res) => {
  try {
    const results = await SearchResult.find({ userId: req.userId }).sort({ fetchedAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
