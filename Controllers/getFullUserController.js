const PersonalDetails = require('../Models/PersonalDetailSignup');
const FinancialDetails = require('../Models/FinancialDetailSignup');
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const MonthlyRevenue = require('../models/MonthlyRevenue');

const getFullUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch personal details by userId
    const personal = await PersonalDetails.findById(userId).lean();
    if (!personal) return res.status(404).json({ message: "User not found" });

    // Fetch financial details using userId
    const financial = await FinancialDetails.findOne({ userId }).lean();

    // Fetch business idea details using userId
    const businessidea = await BusinessIdeaDetails.findOne({ userId }).lean();

    // Fetch monthly revenue using userId
    const monthlyRevenue = await MonthlyRevenue.findOne({ userId }).lean();

    // Add more features in a similar way as needed

    // Combine all data into one response
    res.json({
      personalDetails: personal,
      financialDetails: financial,
      businessIdeaDetails: businessidea,
      features: {
        monthlyRevenue: monthlyRevenue,
        // futureFeature: anotherFeature
      }
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { getFullUser };
