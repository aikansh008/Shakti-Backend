const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const Budget = require('./Budgetschema');
const BusinessType = require('../Models/User/BusinessDetailSignup');
const predictors = require('./predictor');

// Helper to calculate trend and prediction
function calculateTrendAndPrediction(profits) {
  const length = profits.length;

  if (length < 4) {
    return {
      trend: 'increasing',
      prediction: profits[length - 1] * 1.1 || 1000,
      lastFourMonths: profits.slice(-4)
    };
  }

  const lastFour = profits.slice(-4);
  const diffs = [];

  for (let i = 1; i < lastFour.length; i++) {
    diffs.push(lastFour[i] - lastFour[i - 1]);
  }

  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const trend = avgDiff >= 0 ? 'increasing' : 'decreasing';
  const prediction = lastFour[3] + avgDiff;

  return {
    trend,
    prediction,
    lastFourMonths: lastFour
  };
}

router.post('/predict-budget/:sector', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { newProfit } = req.body;
    const requestedSector = req.params.sector.toLowerCase();

    if (typeof newProfit !== 'number') {
      return res.status(400).json({ error: 'newProfit must be a number' });
    }

    const businessdetails = await BusinessType.findOne({ userId });
    if (!businessdetails || !businessdetails.ideaDetails) {
      return res.status(404).json({ error: 'Business details not found' });
    }

    const userBusinessSector = businessdetails.ideaDetails.Business_Sector.toLowerCase();

    if (requestedSector !== userBusinessSector) {
      return res.status(403).json({ error: `You are not registered for the '${requestedSector}' sector.` });
    }

    let budget = await Budget.findOne({ userId, businessType: userBusinessSector });
    if (!budget) {
      budget = new Budget({ userId, businessType: userBusinessSector, profits: [], lastMonthExpenditureHistory: [] });
    }

    budget.profits.push(newProfit);

    const { trend, prediction, lastFourMonths } = calculateTrendAndPrediction(budget.profits);

    const predictorFn = predictors[userBusinessSector];
    if (!predictorFn) {
      return res.status(400).json({ error: `No predictor defined for sector: ${userBusinessSector}` });
    }

    const predictedBudget = predictorFn(budget.profits, newProfit);

    // Extract and store only expenditure (exclude Suggestion)
    const { Suggestion, ...expenditureOnly } = predictedBudget;

    // Initialize history array if not present
    budget.lastMonthExpenditureHistory = budget.lastMonthExpenditureHistory || [];

    // Store expenditure in history
    budget.lastMonthExpenditureHistory.push(expenditureOnly);

    // Limit history to 6 entries
    if (budget.lastMonthExpenditureHistory.length > 6) {
      budget.lastMonthExpenditureHistory.shift(); // Remove oldest
    }

    // (Optional) Still keep the latest for backward compatibility
    budget.lastMonthExpenditure = expenditureOnly;

    await budget.save();

    const secondLastExpenditure =
      budget.lastMonthExpenditureHistory.length >= 2
        ? budget.lastMonthExpenditureHistory[budget.lastMonthExpenditureHistory.length - 2]
        : {};

    const response = {
      businessType: userBusinessSector,
      trend,
      budgetPrediction: prediction,
      predictedBudget,
      lastFourMonths,
      lastMonthExpenditure: secondLastExpenditure
    };

    res.json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
