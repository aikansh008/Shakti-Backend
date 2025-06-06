
const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const Budget = require('../BudgetPrediction/Budgetschema');
const moment = require('moment');

router.get('/profits/last-6-months', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const budget = await Budget.findOne({ userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget data not found' });
    }

    const profits = budget.profits || [];
    const count = 6;
    const lastProfits = profits.slice(-count);

    const currentMonth = moment();

    const profitData = lastProfits.map((profit, index) => {
      const monthMoment = moment(currentMonth).subtract(lastProfits.length - 1 - index, 'months');
      return {
        month: monthMoment.format('YYYY-MM'),
        monthName: monthMoment.format('MMMM'),  // Full month name
        profit,
      };
    });

    res.json({ last6MonthsProfits: profitData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
