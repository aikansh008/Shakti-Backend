const express = require('express');
const router = express.Router();
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const requireAuth = require('../Middlewares/authMiddleware'); // adjust path as needed

router.post('/loans/pay', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { loanId, monthlyPayment } = req.body;

    if (!loanId || typeof monthlyPayment !== 'number' || monthlyPayment <= 0) {
      return res.status(400).json({ message: 'loanId and positive monthlyPayment are required.' });
    }

    // Find financial document of user
    const financialDoc = await FinancialDetails.findOne({ userId });

    if (!financialDoc || !financialDoc.existingloanDetails) {
      return res.status(404).json({ message: 'No loan details found for this user.' });
    }

    // Find loan by loanId
    const loanIndex = financialDoc.existingloanDetails.findIndex(loan => loan._id.toString() === loanId);
    if (loanIndex === -1) {
      return res.status(404).json({ message: 'Loan not found.' });
    }

    const loan = financialDoc.existingloanDetails[loanIndex];

    // If Remaining_Loan_Amount field doesn't exist, initialize it as Total_Loan_Amount
    if (loan.Remaining_Loan_Amount === undefined || loan.Remaining_Loan_Amount === null) {
      loan.Remaining_Loan_Amount = loan.Total_Loan_Amount;
    }

    // Calculate new remaining amount (don't go below zero)
    loan.Remaining_Loan_Amount = Math.max(0, loan.Remaining_Loan_Amount - monthlyPayment);

    // Update the loan in array
    financialDoc.existingloanDetails[loanIndex] = loan;

    // Save updated financial document
    await financialDoc.save();

    res.status(200).json({
      message: 'Payment applied successfully',
      updatedLoan: loan
    });

  } catch (error) {
    console.error('Error updating loan payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
