const express = require('express');
const axios = require('axios');
const moment = require("moment");
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const BuisnessIdeaDeatails = require('../Models/User/BusinessDetailSignup');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const LoanSchemeCache = require('../Models/caching/filter-loans');
require('dotenv').config();

router.post('/', requireAuth, async (req, res) => {
  const userId = req.userId;
  const today = moment().format("YYYY-MM-DD");

const dummySchemes = [
  {
    scheme_name: "Stand-Up India Scheme",
    description: "Provides bank loans between ₹10 lakh and ₹1 crore to SC/ST and women entrepreneurs for setting up greenfield enterprises.",
    eligibility: "SC/ST and/or women entrepreneurs above 18 years of age. Loans only for greenfield projects.",
    url: "https://www.standupmitra.in/"
  },
  {
    scheme_name: "Credit Guarantee Fund Scheme for Micro and Small Enterprises (CGTMSE)",
    description: "Offers collateral-free credit to MSMEs with credit guarantee cover to lending institutions.",
    eligibility: "New and existing micro and small enterprises engaged in manufacturing or service activity (excluding retail trade).",
    url: "https://www.cgtmse.in/"
  },
  {
    scheme_name: "PM Formalisation of Micro Food Processing Enterprises Scheme (PM-FME)",
    description: "Supports micro food processing enterprises through credit-linked subsidy and capacity building.",
    eligibility: "Existing micro food processing units in the unorganized sector, Farmer Producer Organizations (FPOs), SHGs, and cooperatives.",
    url: "https://mofpi.nic.in/pmfme/"
  },
  {
    scheme_name: "Udyogini Scheme",
    description: "Promotes entrepreneurship among women by providing loans for small businesses with low-interest rates.",
    eligibility: "Women entrepreneurs from economically weaker sections, aged 18–55. Family income must not exceed ₹1.5 lakh per annum.",
    url: "https://nsfdc.nic.in/"
  },
  {
    scheme_name: "Development of Women and Children in Rural Areas (DWCRA)",
    description: "Promotes self-employment among women by providing access to credit, skill development, and income-generating activities.",
    eligibility: "Rural women, especially those living below the poverty line (BPL).",
    url: "https://rural.nic.in/"
  },
  {
    scheme_name: "MSME Business Loan in 59 Minutes",
    description: "Enables in-principle approval of loans up to ₹1 crore for MSMEs within 59 minutes through an online portal.",
    eligibility: "MSMEs with valid GST, IT returns, and bank statements.",
    url: "https://www.psbloansin59minutes.com/"
  },
  {
    scheme_name: "Prime Minister’s Employment Generation Programme (PMEGP)",
    description: "Credit-linked subsidy program aimed at generating employment through the establishment of micro enterprises.",
    eligibility: "Individuals above 18 years with at least 8th-grade education. No income ceiling for setting up projects.",
    url: "https://www.kviconline.gov.in/"
  }
];


  try {
    // STEP 1: Check cache
    const existingCache = await LoanSchemeCache.findOne({ userId, date: today });
    if (existingCache && existingCache.status === 200) {
      return res.status(200).json({ recommendedLoans: existingCache.schemes });
    }

    // STEP 2: Optional – gather user data (for potential filtering in future)
    const Business = await BuisnessIdeaDeatails.findById(userId);
    const personal = await PersonalDetails.findById(userId);
    const financial = await FinancialDetails.findById(userId);

    // STEP 3: Cache and return dummy schemes
    await LoanSchemeCache.findOneAndUpdate(
      { userId, date: today },
      { schemes: dummySchemes, status: 200 },
      { upsert: true }
    );

    res.status(200).json({ recommendedLoans: dummySchemes });

  } catch (err) {
    console.error("Loan scheme route error:", err.message || err);
    await LoanSchemeCache.findOneAndUpdate(
      { userId, date: today },
      { status: 500 },
      { upsert: true }
    );
    res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
