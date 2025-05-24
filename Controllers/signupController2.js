const User = require('../Models/BusinessDetailSignup'); // your User mongoose model

const signup2User = async (req, res) => {
  try {
    const userId = req.userId;  // assume this comes from JWT middleware (decoded token)
    const { incomeDetails, assetDetails, existingloanDetails } = req.body;

    const {
      Primary_Monthly_Income,
      Additional_Monthly_Income,
    } = incomeDetails || {};

    const {
      Gold_Asset_amount,
      Gold_Asset_App_Value,
      Land_Asset_Area,
      Land_Asset_App_Value,
    } = assetDetails || {};

    const { Monthly_Payment , Total_Loan_Amount } = existingloanDetails || {};

    // Validate required fields
    if (
      !Primary_Monthly_Income ||
      !Additional_Monthly_Income ||
      !Gold_Asset_amount ||
      !Gold_Asset_App_Value ||
      !Land_Asset_Area ||
      !Land_Asset_App_Value ||
      !Monthly_Payment ||
      !Total_Loan_Amount
    ) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Check if first form data exists (assuming stored in user doc)
    if (!user.personalDetails || !user.professionalDetails || !user.passwordDetails) {
      return res.status(400).json({ message: 'Incomplete form 1 data. Start over.' });
    }

    // Update financial details
    user.FinancialDetails = {
      incomeDetails: {
        Primary_Monthly_Income,
        Additional_Monthly_Income,
      },
      assetDetails: {
        Gold_Asset_amount,
        Gold_Asset_App_Value,
        Land_Asset_Area,
        Land_Asset_App_Value,
      },
      existingloanDetails: {
        Monthly_Payment,
        Total_Loan_Amount,
      },
    };

    // Save updated user
    await user.save();

    res.status(200).json({ message: 'Form 2 saved successfully' });
  } catch (err) {
    console.error('Signup2 Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup2User };
