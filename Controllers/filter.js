const express = require('express');
const axios = require('axios');
const router = express.Router();


const GEMINI_API_KEY = "AIzaSyCzDxZOQmq2TUSyz7LcFUE_RlLn-YsEeTc"; // replace with your key
const SERP_API_KEY = 'AIzaSyAdCvC-KDRXBxxmQLVyQmjbamo4HZ8jaDQ"';     // replace with your SerpAPI key

router.post('/', async (req, res) => {
  const userData = req.body;

  const prompt = `
You are a helpful assistant that recommends Indian Government loan schemes.

**Guidelines:**
- Only suggest **official government loan schemes** hosted on domains like '.gov.in', '.nic.in', and also '${userData.state?.toLowerCase() || 'state'}.gov.in'.
- Response must be in **strictly valid JSON format** — no markdown, no explanations, no triple backticks.
- Do not include any text or headings outside the JSON array.
- All fields must be enclosed in double quotes.
- Eligibility should be returned as an **array of bullet points** (string items).
- Include 7 to 10 relevant loan schemes based on the user profile firstly central government schemes and then state 


**User Details:**
- Gender: ${userData.gender}
- Business Type: ${userData.businessType}
- Location: ${userData.location || 'not specified'}
- Age: ${userData.age || 'not specified'}
- Education: ${userData.education || 'not specified'}
- State: ${userData.state || 'not specified'}
- Total Assets value: ${userData.totalAssetsValue || 'not specified'}
- Caste: ${userData.caste || 'not specified'}
- Previous loan history: ${userData.previousLoanHistory || 'not specified'}

**Return Format:**
[
  {
    "name": "Loan Scheme Name",
    "description": "Brief description of the loan scheme.",
    "eligibility": [
      "Eligibility point 1",
      "Eligibility point 2",
      "Eligibility point 3"
    ],
    "link": "https://example.gov.in"
  },
  {
    "name": "Loan Scheme Name 2",
    "description": "Brief description of the loan scheme.",
    "eligibility": [
      "Eligibility point 1",
      "Eligibility point 2"
    ],
    "link": "https://example2.${userData.state?.toLowerCase() || 'state'}.gov.in"
  }
]
`;


  try {
    // Step 1: Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const replyText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      return res.status(500).json({ error: 'No valid text found in Gemini response.' });
    }

    let cleanedText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    let schemes;
    try {
      schemes = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Gemini response is not valid JSON:", err);
      return res.status(500).json({ error: "Invalid JSON from Gemini." });
    }

    // Step 2: For each scheme, verify link via SerpAPI
    const updatedSchemes = await Promise.all(schemes.map(async scheme => {
      const query = `${scheme.name} site:.gov.in OR site:.nic.in`;

      try {
        const serpResponse = await axios.get('https://serpapi.com/search', {
          params: {
            engine: 'google',
            q: query,
            api_key: SERP_API_KEY
          }
        });

        const firstGovLink = serpResponse.data.organic_results?.find(result =>
          result.link.includes('.gov.in') || result.link.includes('.nic.in')
        )?.link;

        return {
          ...scheme,
          link: firstGovLink || scheme.link // prefer verified link
        };
      } catch (err) {
        console.error(`Error verifying link for ${scheme.name}:`, err.response?.data || err.message);
        return scheme; // return original if link lookup fails
      }
    }));

    res.json({ recommendedLoans: updatedSchemes });

  } catch (err) {
    console.error("Error processing request:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get loan schemes" });
  }
});

module.exports = router;
