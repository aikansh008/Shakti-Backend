const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireAuth = require('../Middlewares/authMiddleware');

const MonthlyRevenue = require('../Models/Budget/MonthlyRevenue');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');

// Budget prediction functions
const { predictrestaurantBudget } = require('../Models/Budget/restaurant');
const { predictretailBudget } = require('../Models/Budget/retailbudget');
const { predicttravelBudget } = require('../Models/Budget/travel');
const { predicthealthBudget } = require('../Models/Budget/healthcare');
const { predictlaundryBudget } = require('../Models/Budget/laundary');
const { predictbeautyBudget } = require('../Models/Budget/beauty');
const { predictmanufacturingBudget }= require('../Models/Budget/manufacturing');
const { predictDairyBudget } = require('../Models/Budget/dairybudget')

// Helper function
async function calculateProfits(userId) {
  const records = await MonthlyRevenue.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3);

  let last3MonthProfits = [];

  if (!records || records.length < 3) {
    last3MonthProfits = [1, 2, 3]; // Placeholder values
  } else {
    last3MonthProfits = records.map((r) => {
      const { sellingPrice, costPrice, expenses } = r;
      return sellingPrice - costPrice -
        expenses.Operational_Expenses -
        expenses.Administrative_Expenses -
        expenses.Optional_Expenses;
    });
  }

  const latestRecord = await MonthlyRevenue.findOne({ userId }).sort({ createdAt: -1 });
  let currentProfit;

  if (!latestRecord) {
    const cost = await BusinessIdeaDetails.findOne({ userId });
    currentProfit = cost?.financialPlan?.Estimated_Startup_Cost || 0;
  } else {
    const { sellingPrice, costPrice, expenses } = latestRecord;
    currentProfit =
      sellingPrice - costPrice -
      expenses.Operational_Expenses -
      expenses.Administrative_Expenses -
      expenses.Optional_Expenses;
  }

  const lastFourMonths = [...last3MonthProfits.slice(-3), currentProfit];
  return { lastFourMonths, currentProfit };
}

// Common handler
async function handleBudgetPrediction(req, res, businessType, predictFunction) {
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    const { lastFourMonths, currentProfit } = await calculateProfits(userId);
    const budgetPrediction = await predictFunction(lastFourMonths, currentProfit);

    res.json({
      businessType,
      budgetPrediction,
      lastFourMonths
    });
  } catch (err) {
    console.error(`Error in /${businessType} route:`, err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Routes
router.post('/restaurant', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'restaurant', predictrestaurantBudget));

router.post('/retails', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'retail', predictretailBudget));

router.post('/travel', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'travel', predicttravelBudget));

router.post('/health', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'healthcare', predicthealthBudget));

router.post('/laundry', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'laundry', predictlaundryBudget));

router.post('/beauty', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'beauty', predictbeautyBudget));

router.post('/manufacturing', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'manufacturing', predictmanufacturingBudget));

router.post('/dairy', requireAuth, (req, res) => handleBudgetPrediction(req, res, 'dairy', predictDairyBudget));



module.exports = router;
