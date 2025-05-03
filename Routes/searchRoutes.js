const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;

router.get('/', async (req, res) => {
  const query = req.query.q;
  const lang = req.query.lang || 'hi'; // default to Gujarati

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const langRestrict = `lang_${lang}`; // Google language restriction format

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${query} site:.in`,
        gl: 'IN',            // India region
        hl: lang,            // User interface language
        lr: langRestrict     // Result language restriction
      }
    });

    const results = (response.data.items || []).slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    res.json(results);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Error fetching search results' });
  }
});

module.exports = router;
