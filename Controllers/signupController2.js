const tempUsers = require('../tempUserStore');

const signup2User = async (req, res) => {
  try {
    const { sessionId, incomeDetails, assetDetails, existingloanDetails } = req.body;
    const {
      Primary_Monthly_Income,
      Additional_Monthly_Income,
    } = incomeDetails;

    const {
      Gold_Asset_amount,
      Gold_Asset_App_Value,
      Land_Asset_Area,
      Land_Asset_App_Value,
    } = assetDetails;

    const { Monthly_Payment } = existingloanDetails;

    // Check if all fields are present
    if (
      !sessionId ||
      !Primary_Monthly_Income ||
      !Additional_Monthly_Income ||
      !Gold_Asset_amount ||
      !Gold_Asset_App_Value ||
      !Land_Asset_Area ||
      !Land_Asset_App_Value ||
      !Monthly_Payment
    ) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Get the user from the temp store using sessionId
    const user = tempUsers.get(sessionId);
    if (!user) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Make sure the form 1 data exists
    if (!user.personalDetails || !user.professionalDetails || !user.passwordDetails) {
      return res.status(400).json({ message: 'Incomplete form 1 data. Start over.' });
    }

    // Store FinancialDetails in the user object
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
      },
    };

    // Save updated user to tempUsers
    tempUsers.set(sessionId, user);
    res.status(200).json({ message: 'Form 2 saved' });
  } catch (err) {
    console.error('Signup2 Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup2User };
