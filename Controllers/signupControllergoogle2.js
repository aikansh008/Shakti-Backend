const PersonalDetails = require("../Models/PersonalDetailSignup");

const signup2Usergoogle = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    const { incomeDetails, assetDetails, existingloanDetails } = req.body;

    // Validate required fields from incomeDetails
    if (
      !incomeDetails?.Primary_Monthly_Income ||
      !incomeDetails?.Additional_Monthly_Income ||
      !assetDetails?.Gold_Asset_amount ||
      !assetDetails?.Gold_Asset_App_Value ||
      !assetDetails?.Land_Asset_Area ||
      !assetDetails?.Land_Asset_App_Value ||
      !existingloanDetails?.Monthly_Payment ||
      !existingloanDetails?.Total_Loan_Amount
    ) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Await the DB query
    const userSession = await PersonalDetails.findById(userId);

    // Check if user found and has required first form data
    if (!userSession || !userSession.professionalDetails || !userSession.passwordDetails) {
      return res.status(400).json({ message: 'Incomplete form 1 data. Start over.' });
    }

    // Update the user's financial details
    userSession.FinancialDetails = {
      incomeDetails,
      assetDetails,
      existingloanDetails,
    };

    // Save the updated document back to the DB
    await userSession.save();

    res.status(200).json({ message: 'Form 2 saved' });
  } catch (err) {
    console.error('Signup2 Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup2Usergoogle };
