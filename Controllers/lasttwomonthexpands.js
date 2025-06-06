const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');
const Budget = require('../BudgetPrediction/Budgetschema');

// Route to get last two months' expenditures for each sector
router.get('/last-two-expenditures', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    // Find all budget documents associated with the user
    const budgets = await Budget.find({ userId });

    if (!budgets || budgets.length === 0) {
      return res.status(404).json({ error: 'No budget data found for this user.' });
    }

    const result = budgets.map(budget => {
      const history = budget.lastMonthExpenditureHistory || [];

      // Get the last two expenditures (if available)
      const lastTwoExpenditures = history.slice(-2);

      return {
        businessType: budget.businessType,
        lastTwoExpenditures
      };
    });

    res.json({ expenditures: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
