const Profit = require('../models/Profit');

async function updateMonthlyProfits(userId, currentProfit) {
  let profitDoc = await Profit.findOne({ userId });

  if (!profitDoc) {
    profitDoc = new Profit({ userId, monthlyProfits: [currentProfit] });
  } else {
    profitDoc.monthlyProfits.push(currentProfit);
    // Optional: limit stored profits to last 12 months
    if (profitDoc.monthlyProfits.length > 12) {
      profitDoc.monthlyProfits.shift();
    }
  }

  await profitDoc.save();
}

module.exports = { updateMonthlyProfits };
