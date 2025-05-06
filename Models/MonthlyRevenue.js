const mongoose = require('mongoose');

const MonthlyRevenueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalDetails',
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  costPrice: {
    type: Number,
    required: true,
  },
  expenses: {
    Operational_Expenses: {
      type: Number,
      required: true,
    },
    Administrative_Expenses: {
      type: Number,
      required: true,
    },
    Optional_Expenses: {
      type: Number,
      required: true,
    },
  }
}, { timestamps: true });

// 3rd argument 'monthlyrevenues' ensures this creates a separate collection
module.exports = mongoose.model('MonthlyRevenue', MonthlyRevenueSchema, 'monthlyrevenues');
