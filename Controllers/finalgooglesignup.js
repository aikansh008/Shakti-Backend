const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const signup3googleUser = async (req, res) => {
  try {
    // Get JWT token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Extract userId and email from token
    const { userId, email } = decoded;

    if (!userId || !email) {
      return res.status(400).json({ message: 'Token missing required user data' });
    }

    // Extract financialDetails from request body
    const { financialDetails } = req.body;

    if (!financialDetails) {
      return res.status(400).json({ message: 'Financial details are required!' });
    }

    // Validate required financial fields
    const {
      Estimated_Startup_Cost,
      Funding_Required,
      Expected_Revenue_First_Year
    } = financialDetails;

    if (
      Estimated_Startup_Cost === undefined ||
      Funding_Required === undefined ||
      Expected_Revenue_First_Year === undefined
    ) {
      return res.status(400).json({ message: 'All financial detail fields are required!' });
    }

    // Save financial details with userId from token
    const newFinancial = new FinancialDetails({
      userId,
      ...financialDetails
    });

    await newFinancial.save();

    return res.status(201).json({
      message: 'Financial details saved successfully!',
      userId,
      email
    });

  } catch (err) {
    console.error('SaveFinancialDetails Error:', err);
    return res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup3googleUser };
