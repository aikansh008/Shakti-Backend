const express = require('express');
const axios = require('axios');
const router = express.Router();
const Redis = require('ioredis');
const requireAuth = require('../Middlewares/authMiddleware');
const BuisnessIdeaDeatails = require('../Models/User/BusinessDetailSignup');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY5;
const SERP_API_KEY = process.env.GOOGLE_API_KEY;

const redis = new Redis({
  host: '172.17.0.1',
  port: 6379
});  
router.post('/', requireAuth, async (req, res) => {
  const userID = req.userId;

  const CACHE_KEY = `loan_recommendations:${userID}`;
  const TTL_SECONDS = 60 * 60 * 24; // 24 hours

  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      console.log('✅ Returned from Redis cache');
      return res.json(JSON.parse(cached));
    }
  } catch (err) {
    console.warn('⚠️ Redis read failed:', err.message);
  }

  const Business = await BuisnessIdeaDeatails.findById(userID);
  const personal = await PersonalDetails.findById(userID);
  const financial = await FinancialDetails.findById(userID);
  const totalAssets =
    financial?.assetDetails?.Gold_Asset_App_Value +
    financial?.assetDetails?.Land_Asset_App_Value;

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
- Require_Loan: ${Business?.financialPlan.Estimated_Startup_Cost || 'not specified'}
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
  }
]
`;

  let updatedSchemes;

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const replyText = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) throw new Error('No valid response');

    let cleanedText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    let schemes = JSON.parse(cleanedText);

    updatedSchemes = await Promise.all(
      schemes.map(async (scheme) => {
        const query = `${scheme.name} loan ${Business?.ideaDetails?.Buisness_City || 'Delhi'} site:.com`;

        try {
          const serpResponse = await axios.get('https://serpapi.com/search', {
            params: {
              engine: 'google',
              q: query,
              api_key: SERP_API_KEY,
            },
          });

          const firstValidLink = serpResponse.data.organic_results?.find(
            (result) => result.link.includes('.com') || result.link.includes('.in')
          )?.link;

          return {
            ...scheme,
            link: firstValidLink || scheme.link,
          };
        } catch (err) {
          console.warn(`SerpAPI failed for ${scheme.name}`);
          return scheme;
        }
      })
    );
  } catch (err) {
    console.warn('⚠️ Gemini or SerpAPI failed, using dummy data');

    updatedSchemes = [
      {
        name: "HDFC Personal Loan",
        description: "Personal loan for various needs.",
        eligibility: [
          "Minimum age requirement",
          "Stable income source",
          "Good credit score"
        ],
        link: "https://www.hdfcbank.com/personal/loans/personal-loan"
      },
      {
        name: "ICICI Bank Personal Loan",
        description: "Tailored personal loan options.",
        eligibility: [
          "Minimum age and income criteria",
          "Employment verification",
          "Credit history review"
        ],
        link: "https://www.icicibank.com/personal-banking/loans/personal-loan"
      },
      {
        name: "Axis Bank Personal Loan",
        description: "Flexible personal loan with various repayment options.",
        eligibility: [
          "Specific age and employment conditions",
          "Income documentation",
          "Creditworthiness assessment"
        ],
        link: "https://www.axisbank.com/personal-loan"
      },
      {
        name: "Bajaj Finserv Personal Loan",
        description: "Quick and easy personal loan disbursement.",
        eligibility: [
          "Age and employment eligibility",
          "Income proof",
          "Credit score check"
        ],
        link: "https://www.bajajfinserv.in/personal-loan"
      },
      {
        name: "Kotak Mahindra Bank Personal Loan",
        description: "Personal loan with competitive interest rates.",
        eligibility: [
          "Age and income requirements",
          "Proof of identity and address",
          "Credit score evaluation"
        ],
        link: "https://www.kotak.com/en/personal-banking/loans/personal-loan"
      },
      {
        name: "IndusInd Bank Personal Loan",
        description: "Personalized personal loan solutions.",
        eligibility: [
          "Age and income criteria",
          "Employment stability",
          "Credit report analysis"
        ],
        link: "https://www.indusind.com/personal-banking/loans/personal-loan"
      },
      {
        name: "Standard Chartered Personal Loan",
        description: "Personal loan with various repayment tenures.",
        eligibility: [
          "Minimum age and income requirements",
          "Proof of income",
          "Credit history review"
        ],
        link: "https://www.sc.com/in/personal-banking/borrowing/personal-loans.html"
      },
      {
        name: "IDFC FIRST Bank Personal Loan",
        description: "Flexible personal loan options with online application.",
        eligibility: [
          "Age and income eligibility",
          "Employment proof",
          "Credit score assessment"
        ],
        link: "https://www.idfcfirstbank.com/personal-banking/loans/personal-loans"
      },
      {
        name: "Yes Bank Personal Loan",
        description: "Quick disbursal personal loan.",
        eligibility: [
          "Minimum age and income criteria",
          "Employment verification",
          "Credit history review"
        ],
        link: "https://www.yesbank.in/personal-banking/loans/personal-loans"
      }
    ];
  }

  try {
    await redis.set(CACHE_KEY, JSON.stringify({ recommendedLoans: updatedSchemes }), 'EX', TTL_SECONDS);
    console.log('🧠 Cached response in Redis');
  } catch (cacheErr) {
    console.warn('⚠️ Redis write failed:', cacheErr.message);
  }

  res.json({ recommendedLoans: updatedSchemes });
});

module.exports = router;
