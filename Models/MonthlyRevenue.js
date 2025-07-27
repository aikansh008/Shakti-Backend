const mongoose = require('mongoose');

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> origin/master
const MonthlyDataSchema = new mongoose.Schema({
  month: String, // e.g., "Jan 2024"
  revenue: {
    type: Number,
    default: 0
  }
}, { _id: false });

<<<<<<< HEAD
=======
>>>>>>> origin/master
>>>>>>> origin/master
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
  }
}, { timestamps: true });

// 3rd argument 'monthlyrevenues' ensures this creates a separate collection
=======
>>>>>>> origin/master
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

<<<<<<< HEAD
=======
>>>>>>> origin/master
>>>>>>> origin/master
module.exports = mongoose.model('MonthlyRevenue', MonthlyRevenueSchema, 'monthlyrevenues');
