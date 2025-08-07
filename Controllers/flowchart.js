const express = require('express');
const axios = require('axios');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');

const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const { handleAIWithCache } = require('../services/aiservices');

require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY5;

router.post('/flow-chart', requireAuth, async (req, res) => {
  const userID = req.userId;

  try {
    const Business = await BusinessIdeaDetails.findById(userID);
    const personal = await PersonalDetails.findById(userID);
    const financial = await FinancialDetails.findById(userID);

    const totalAssets =
      (financial?.assetDetails?.Gold_Asset_App_Value || 0) +
      (financial?.assetDetails?.Land_Asset_App_Value || 0);

    const prompt = `
You are a smart and helpful assistant that recommends realistic next steps for a business to grow profitably and become scalable.

**User Details:**
- Gender: ${personal?.personalDetails?.gender || 'male'}
- Age: ${personal?.personalDetails?.age || 'not specified'}
- Business Type: ${Business?.ideaDetails?.Business_Sector || 'not specified'}
- Location: ${Business?.ideaDetails?.Business_Location || 'not specified'}
- Total Assets value: ₹${totalAssets}
- Require_Loan: ₹${Business?.financialPlan?.Estimated_Startup_Cost || 'not specified'}
- Previous Loan History: ₹${financial?.existingloanDetails?.Total_Loan_Amount || 'not specified'}
- Income: ₹${financial?.incomeDetails?.Primary_Monthly_Income || 'not specified'}
- Gold Asset Value: ₹${financial?.assetDetails?.Gold_Asset_App_Value || 'not specified'}

**Return Format:**
[
  {
    "Suggestion": "Step to improve business",
    "description": "Why this step is appropriate for the user's current condition"
  }
]
`;

    const result = await handleAIWithCache({
      userId: userID,
      requestType: 'flow-chart',
      prompt,
      callGemini: async (inputPrompt) => {
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: inputPrompt }] }] },
          { headers: { 'Content-Type': 'application/json' } }
        );

        let replyText =
          geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;

        replyText = replyText
          ?.replace(/```json/g, '')
          ?.replace(/```/g, '')
          ?.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          ?.trim();

        return JSON.parse(replyText);
      },
    });

    res.json({
      fromDummy: result.status === 0,
      recommendedLoans: result.data,
    });
  } catch (err) {
    console.error('Flowchart Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
