const express = require('express');
const router = express.Router();
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const requireAuth = require('../Middlewares/authMiddleware'); // adjust path as needed
const Budget = require('../BudgetPrediction/Budgetschema'); // adjust path as 
router.get('/loans', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const financialDoc = await FinancialDetails.findOne({ userId });

    if (!financialDoc || !financialDoc.existingloanDetails) {
      return res.status(404).json({ message: 'No loan details found for this user.' });
    }

    const loans = financialDoc.existingloanDetails;

    const totalRemaining = loans.reduce((sum, loan) => {
      return sum + (loan.Remaining_Loan_Amount || 0);
    }, 0);
        const totalinstallment = loans.reduce((sum, loan) => {
      return sum + (loan.Monthly_Payment || 0);
    }, 0);
const investmentDoc = await Budget.findOne({ userId: userId });

let investmentAmount = 0;

if (
  investmentDoc?.lastMonthExpenditureHistory?.length &&
  typeof investmentDoc.lastMonthExpenditureHistory.at(-1)?.Investment === 'number'
) {
  investmentAmount = investmentDoc.lastMonthExpenditureHistory.at(-1).Investment;
}

    res.status(200).json({
      loans,
      totalRemainingLoanAmount: totalRemaining,
      investmentAmount,
      totalinstallment
    });

  } catch (error) {
    console.error('Error fetching user loan details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
