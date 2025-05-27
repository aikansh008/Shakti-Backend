const express = require('express');
const axios = require('axios');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const BuisnessIdeaDeatails = require('../Models/User/BusinessDetailSignup');
const PersonalDetails= require('../Models/User/PersonalDetailSignup');
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY // replace with your key
const SERP_API_KEY = process.env.GOOGLE_API_KEY;     // replace with your SerpAPI key

router.post('/', requireAuth, async (req, res) => {
  const userID = req.userId;
  const Business = await  BuisnessIdeaDeatails.findById(userID);
  const personal = await PersonalDetails.findById(userID);
  const financial =await FinancialDetails.findById(userID);
  const totalAssets = financial?.assetDetails?.Gold_Asset_App_Value + financial?.assetDetails?.Land_Asset_App_Value;


  const prompt = `
You are a helpful assistant that recommends Indian Government loan schemes.

**Guidelines:**
- Only suggest **official government loan schemes** hosted on domains like '.gov.in', '.nic.in', and also '${Business?.ideaDetails?.Business_Location?.toLowerCase() || 'state'}.gov.in'.
- Response must be in **strictly valid JSON format** — no markdown, no explanations, no triple backticks.
- Do not include any text or headings outside the JSON array.
- All fields must be enclosed in double quotes.
- Eligibility should be returned as an **array of bullet points** (string items).
- Include 7 to 10 relevant loan schemes based on the user profile firstly central government schemes and then state 


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
    "link": "https://example2.${Business?.ideaDetails?.Business_Location?.toLowerCase() || 'state'}.gov.in"
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
