const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessType: { type: String, required: true },
  profits: [Number],
  lastMonthExpenditure: { type: Object }, // Optional - still available
  lastMonthExpenditureHistory: {
    type: [Object], // Array of expenditure entries (excluding Suggestion)
    default: []
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
