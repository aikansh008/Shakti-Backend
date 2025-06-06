const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireAuth = require('../Middlewares/authMiddleware');

const Profit = require('../models/Profit');
const { predictDairyBudget } = require('../Models/Budget/dairybudget');
const { updateMonthlyProfits } = require('../utils/curentprofit');

router.post('/dairy', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { currentProfit } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  if (typeof currentProfit !== 'number') {
    return res.status(400).json({ error: 'currentProfit must be a number' });
  }

  try {
    // Fetch user's profit record
    let profitDoc = await Profit.findOne({ userId });
    let monthlyProfits = profitDoc ? profitDoc.monthlyProfits : [];

    // Use last 4 profits or assume increasing if less than 4
    let last4MonthProfits = monthlyProfits.length >= 4
      ? monthlyProfits.slice(-4)
      : monthlyProfits.length > 0
        ? monthlyProfits
        : [0, 0, 0]; // or empty array, but trendDirection handles <4 profits

    // Add currentProfit to prediction array for budget prediction
    const profitsForPrediction = [...last4MonthProfits, currentProfit].slice(-4);

    // Get budget prediction
    const budget = predictDairyBudget(profitsForPrediction, currentProfit);

    // Save currentProfit into DB
    await updateMonthlyProfits(userId, currentProfit);

    res.json({ budget, last4MonthProfits: profitsForPrediction });
  } catch (err) {
    console.error('Error processing dairy budget:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
