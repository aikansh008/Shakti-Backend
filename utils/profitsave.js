const MonthlyBudget = require('../Models/profitschema');
const mongoose = require('mongoose');
const moment = require('moment');

async function handleBudgetPredictionnew(req, res) {
  const userId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format' });
  }

  try {
    const { lastFourMonths, currentProfit } = await calculateProfits(userId);

    // Update monthly profits
    await updateMonthlyProfits(userId, currentProfit);

    // Assume your dairy budget prediction logic here:
    const budgetPrediction = someDairyPredictionFunction(lastFourMonths, currentProfit);

    // Save prediction
    const currentMonth = moment().format('YYYY-MM');
    await MonthlyBudget.create({
      userId,
      month: currentMonth,
      businessType: 'dairy',
      budget: budgetPrediction
    });

    res.json({
      businessType: 'dairy',
      budgetPrediction,
      lastFourMonths
    });
  } catch (err) {
    console.error('Error in /dairy route:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { handleBudgetPredictionnew };
