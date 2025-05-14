const mongoose = require('mongoose');

const MonthlyDataSchema = new mongoose.Schema({
  month: String, // e.g., "Jan 2024"
  revenue: {
    type: Number,
    default: 0
  }
}, { _id: false });

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
  },
  monthlyRevenue: {
    type: [MonthlyDataSchema],
    default: () => {
      const now = new Date();
      const months = [];
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months.push({ month: monthLabel, revenue: 0 });
      }
      return months;
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('MonthlyRevenue', MonthlyRevenueSchema, 'monthlyrevenues');
