const tempUsers = require('../tempUserStore');

const payLoan = (req, res) => {
  try {
    const { loanId, paymentAmount } = req.body;

    if (!loanId || typeof paymentAmount !== 'number') {
      return res.status(400).json({ message: 'loanId and paymentAmount are required' });
    }

    const userInfo = req.user; // Populated by JWT middleware
    if (!userInfo || !userInfo.id) {
      return res.status(401).json({ message: 'Unauthorized: User info not found in request' });
    }

    // Find the user in tempUsers store using user ID
    const userEntry = Array.from(tempUsers.entries()).find(([_, user]) => user.userId === userInfo.id);
    if (!userEntry) {
      return res.status(404).json({ message: 'User not found in session store' });
    }

    const [sessionId, user] = userEntry;

    if (!user.FinancialDetails || !user.FinancialDetails.existingloanDetails) {
      return res.status(400).json({ message: 'User financial details are missing' });
    }

    const loan = user.FinancialDetails.existingloanDetails.find(l => l.loanId === loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found for this user' });
    }

    // Deduct payment from remaining amount
    loan.Remaining_Loan_Amount -= paymentAmount;
    if (loan.Remaining_Loan_Amount < 0) loan.Remaining_Loan_Amount = 0;

    // Save back to store
    tempUsers.set(sessionId, user);

    res.status(200).json({
      message: 'Payment recorded successfully',
      loanId,
      Remaining_Loan_Amount: loan.Remaining_Loan_Amount
    });
  } catch (err) {
    console.error('Loan Payment Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { payLoan };
