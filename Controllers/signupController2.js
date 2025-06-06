const tempUsers = require('../tempUserStore');

const signup2User = async (req, res) => {
  try {
    const { sessionId, incomeDetails, assetDetails, existingloanDetails } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    if (
      !incomeDetails ||
      typeof incomeDetails.Primary_Monthly_Income !== 'number' ||
      typeof incomeDetails.Additional_Monthly_Income !== 'number'
    ) {
      return res.status(400).json({ message: 'Income details are required and must be complete' });
    }

    if (
      !assetDetails ||
      typeof assetDetails.Gold_Asset_amount !== 'number' ||
      typeof assetDetails.Gold_Asset_App_Value !== 'number' ||
      typeof assetDetails.Land_Asset_Area !== 'number' ||
      typeof assetDetails.Land_Asset_App_Value !== 'number'
    ) {
      return res.status(400).json({ message: 'Asset details are required and must be complete' });
    }

    if (
      !Array.isArray(existingloanDetails) ||
      existingloanDetails.length === 0 ||
      !existingloanDetails.every(loan =>
        typeof loan.Monthly_Payment === 'number' &&
        typeof loan.Lender_Name === 'string' &&
        typeof loan.Loan_Type === 'string' &&
        typeof loan.Total_Loan_Amount === 'number' &&
        typeof loan.Loan_Years === 'number' &&
        typeof loan.Interest_Rate === 'number'
      )
    ) {
      return res.status(400).json({ message: 'All loan details must be complete and in array format' });
    }

    const user = tempUsers.get(sessionId);
    if (!user) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (!user.personalDetails || !user.professionalDetails || !user.passwordDetails) {
      return res.status(400).json({ message: 'Incomplete form 1 data. Start over.' });
    }

    const enrichedLoanDetails = existingloanDetails.map(loan => {
      const principal = loan.Total_Loan_Amount;
      const rate = loan.Interest_Rate / 100;
      const time = loan.Loan_Years;
      const compoundedAmount = principal * Math.pow((1 + rate), time);

      return {
        ...loan,
        Remaining_Loan_Amount: compoundedAmount
      };
    });

    user.FinancialDetails = {
      incomeDetails,
      assetDetails,
      existingloanDetails: enrichedLoanDetails,
    };

    tempUsers.set(sessionId, user);

    res.status(200).json({ message: 'Form 2 saved' });
  } catch (err) {
    console.error('Signup2 Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup2User };
