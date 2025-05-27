const loginLimiter = require('../Middlewares/ratelimiter');
const MonthlyRevenue = require('../Models/Budget/MonthlyRevenue');

const createMonthlyRevenue = async (req, res) => {
  try {
    const { sellingPrice, costPrice, expenses } = req.body;

    if (
      sellingPrice == null || costPrice == null ||
      !expenses ||
      expenses.Operational_Expenses == null ||
      expenses.Administrative_Expenses == null ||
      expenses.Optional_Expenses == null
    ) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const newRevenue = new MonthlyRevenue({
      userId: req.userId,
      sellingPrice,
      costPrice,
      expenses,
    });

    const savedRevenue = await newRevenue.save();

    res.status(201).json({
      message: 'Monthly revenue record created successfully!',
      data: savedRevenue,
    });
  } catch (err) {
    console.error('Create MonthlyRevenue Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { createMonthlyRevenue };






