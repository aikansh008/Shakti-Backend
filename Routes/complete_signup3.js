const expressFinal = require('express');
const FinancialDetails = require('../Models/FinancialDetailSignup');
const PersonalDetailSignup = require('../Models/PersonalDetailSignup');
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const tempUsersFinal = require('../tempUserStore');

const finalRouter = expressFinal.Router();

finalRouter.post('/financial-details', async (req, res) => {
  try {
    const { sessionId, incomeDetails, assetDetails, existingloanDetails } = req.body;

    const tempUser = tempUsersFinal.get(sessionId);
    if (!tempUser) {
      return res.status(400).json({ message: 'Invalid or expired session ID' });
    }

    // Create user document in BusinessDetailSignup
    const user = new PersonalDetailSignup({
      personalDetails: tempUser.personalDetails,
      professionalDetails: tempUser.professionalDetails,
      passwordDetails: tempUser.passwordDetails
    });
    await user.save();

    // Create BusinessIdeaDetails document
    const businessIdea = new BusinessIdeaDetails({
      userId: user._id,
      sessionId,
      ...tempUser.businessDetails
    });
    await businessIdea.save();

    // Create FinancialDetails document
    const finance = new FinancialDetails({
      userId: user._id,
      incomeDetails,
      assetDetails,
      existingloanDetails
    });
    await finance.save();

    // Clear temporary store
    tempUsersFinal.delete(sessionId);

    res.status(200).json({ message: 'User registered successfully', userId: user._id });
  } catch (err) {
    console.error('Error saving financial details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = finalRouter;