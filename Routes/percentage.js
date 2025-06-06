const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const Budget = require('../BudgetPrediction/Budgetschema');

// Utility: Calculate percentage change and type
// Utility: Calculate percentage change and type
function getChangeDetails(profits) {
  const len = profits.length;
  if (len < 2) {
    return { changeType: 'N/A', percentageChange: '0%', curr: 0 };
  }

  const prev = profits[len - 2];
  const curr = profits[len - 1];

  if (prev === 0) return { changeType: 'N/A', percentageChange: '0%', curr };

  const diff = curr - prev;
  const percent = (diff / prev) * 100;

  let changeType = 'no change';
  if (percent > 0) changeType = 'increase';
  else if (percent < 0) changeType = 'decrease';

  return {
    changeType,
    percentageChange: `${percent.toFixed(2)}%`,
    curr
  };
}

// Utility: Predict next profit
function predictNextProfit(profits) {
  const len = profits.length;
  if (len < 2) return profits[len - 1] * 1.1 || 1000;

  const [prev, curr] = profits.slice(-2);
  const avgDiff = curr - prev;
  return curr + avgDiff;
}

router.get('/predict-profit', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const budget = await Budget.findOne({ userId });

    if (!budget || !Array.isArray(budget.profits) || budget.profits.length < 1) {
      return res.status(404).json({ error: 'Not enough profit data available' });
    }

    const { changeType, percentageChange, curr } = getChangeDetails(budget.profits);
    const predictedProfit = predictNextProfit(budget.profits);

    res.json({
      lastTwoProfits: budget.profits.slice(-2),
      changeType,
      percentageChange,
      predictedProfit,
      curr,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
