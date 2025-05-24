const express = require('express');
const axios = require('axios');
const router = express.Router();
const requireAuth=  require('../Middlewares/authMiddleware');
const BuisnessIdeaDeatails = require('../Models/BusinessDetailSignup');
const PersonalDetails= require('../Models/PersonalDetailSignup');
const FinancialDetails = require('../Models/FinancialDetailSignup');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERP_API_KEY = process.env.GOOGLE_API_KEY;

router.post('/',  requireAuth ,async (req, res) => {
  const userID = req.userId;
    const Business = await  BuisnessIdeaDeatails.findById(userID);
    const personal = await PersonalDetails.findById(userID);
    const financial =await FinancialDetails.findById(userID);
    const totalAssets = financial?.assetDetails?.Gold_Asset_App_Value + financial?.assetDetails?.Land_Asset_App_Value;

  const prompt = `
You are a helpful assistant that recommends private bank loan schemes based on the user's city and state in India.

**Guidelines:**
- Only suggest **official private bank or NBFC loan schemes** from legitimate financial institutions.
- Prefer domains ending in '.com' (e.g., icicibank.com, hdfcbank.com, bajajfinserv.in, etc.)
- Response must be in **strictly valid JSON format** — no markdown, no explanations, no triple backticks.
- Do not include any text or headings outside the JSON array.
- All fields must be enclosed in double quotes.
- Eligibility should be returned as an **array of bullet points** (string items).
- Include **7 to 10 relevant private loan schemes** available in or near the user's city/state.

**User Details:**
- Gender: ${personal?.personalDetails?.gender || 'male'}
- Business Type: ${Business?.ideaDetails?.Business_Sector || 'not specified'}
- Location: ${Business?.ideaDetails?.Business_Location || 'not specified'}
- Age: ${personal?.personalDetails?.age || 'not specified'}
- Education: ${personal?.professionalDetails?.Educational_Qualifications || 'not specified'}
- State: ${Business?.ideaDetails?.Business_Location || 'not specified'}
- Total Assets value: ${totalAssets || 'not specified'}
- Require_Loan: ${Business?.financialPlan.Estimated_Startup_Cost|| 'not specified'}
- Previous loan history: ${financial?.existingloanDetails.Total_Loan_Amount || 'not specified'}
-Income: ${financial?.incomeDetails.Primary_Monthly_Income || 'not specified'}
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
    "link": "https://example.com"
  },
  {
    "name": "Loan Scheme Name 2",
    "description": "Brief description of the loan scheme.",
    "eligibility": [
      "Eligibility point 1",
      "Eligibility point 2"
    ],
    "link": "https://example2.com"
  }
]
`;

  try {
    // Step 1: Get schemes from Gemini
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

    // Step 2: Verify each link using SerpAPI
    const updatedSchemes = await Promise.all(schemes.map(async scheme => {
      const query = `${scheme.name} loan ${Business?.ideaDetails?.Buisness_City || 'Delhi'} ${Business?.ideaDetails?.Business_Location|| 'Delhi'} site:.com`;

      try {
        const serpResponse = await axios.get('https://serpapi.com/search', {
          params: {
            engine: 'google',
            q: query,
            api_key: SERP_API_KEY
          }
        });

        const firstValidLink = serpResponse.data.organic_results?.find(result =>
          result.link.includes('.com') || result.link.includes('.in')
        )?.link;

        return {
          ...scheme,
          link: firstValidLink || scheme.link
        };
      } catch (err) {
        console.error(`Error verifying link for ${scheme.name}:`, err.response?.data || err.message);
        return scheme;
      }
    }));

    res.json({ recommendedLoans: updatedSchemes });

  } catch (err) {
    console.error("Error processing request:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get private loan schemes" });
  }
});

module.exports = router;
