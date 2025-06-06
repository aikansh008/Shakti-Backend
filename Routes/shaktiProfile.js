// to fetch shaktiuser details
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireAuth = require('../Middlewares/authMiddleware');

// Models
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');
const FinancialDetail = require('../Models/User/FinancialDetailSignup');

// GET user details (existing route)
router.get('/shaktidetails', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // 1. Personal Info
    const user = await PersonalDetails.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // 2. Business Info
    const business = await BusinessIdeaDetails.findOne({ userId });
    
    // 3. Financial Info
    const financial = await FinancialDetail.findOne({ userId });
    
    const response = {
      name: user.personalDetails.Full_Name,
      email: user.personalDetails.Email,
      business: business,
      financial: financial
    };
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



router.put('/shaktidetails', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    // Validate that user exists
    const user = await PersonalDetails.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let updatedBusiness = null;
    let updatedFinancial = null;

    // Build dynamic update object for business
    if (updateData.business) {
      const businessUpdate = {};

      // Handle ideaDetails updates
      if (updateData.business.ideaDetails) {
        Object.keys(updateData.business.ideaDetails).forEach(key => {
          businessUpdate[`ideaDetails.${key}`] = updateData.business.ideaDetails[key];
        });
      }

      // Handle financialPlan updates
      if (updateData.business.financialPlan) {
        Object.keys(updateData.business.financialPlan).forEach(key => {
          businessUpdate[`financialPlan.${key}`] = updateData.business.financialPlan[key];
        });
      }

      // Handle operationalPlan updates
      if (updateData.business.operationalPlan) {
        Object.keys(updateData.business.operationalPlan).forEach(key => {
          businessUpdate[`operationalPlan.${key}`] = updateData.business.operationalPlan[key];
        });
      }

      if (Object.keys(businessUpdate).length > 0) {
        businessUpdate.updatedAt = new Date();
        updatedBusiness = await BusinessIdeaDetails.findOneAndUpdate(
          { userId },
          { $set: businessUpdate },
          { new: true, upsert: true }
        );
      }
    }

    // Build dynamic update object for financial
    if (updateData.financial) {
      const financialUpdate = {};

      // Handle incomeDetails updates
      if (updateData.financial.incomeDetails) {
        Object.keys(updateData.financial.incomeDetails).forEach(key => {
          financialUpdate[`incomeDetails.${key}`] = updateData.financial.incomeDetails[key];
        });
      }

      // Handle assetDetails updates
      if (updateData.financial.assetDetails) {
        Object.keys(updateData.financial.assetDetails).forEach(key => {
          financialUpdate[`assetDetails.${key}`] = updateData.financial.assetDetails[key];
        });
      }

      // Handle existingloanDetails (full array replacement)
      if (updateData.financial.existingloanDetails) {
        financialUpdate.existingloanDetails = updateData.financial.existingloanDetails;
      }

      if (Object.keys(financialUpdate).length > 0) {
        financialUpdate.updatedAt = new Date();
        updatedFinancial = await FinancialDetail.findOneAndUpdate(
          { userId },
          { $set: financialUpdate },
          { new: true, upsert: true }
        );
      }
    }

    // Get current data for response
    const currentBusiness = updatedBusiness || await BusinessIdeaDetails.findOne({ userId });
    const currentFinancial = updatedFinancial || await FinancialDetail.findOne({ userId });

    const response = {
      name: user.personalDetails.Full_Name,
      email: user.personalDetails.Email,
      business: currentBusiness,
      financial: currentFinancial
    };

    res.json({
      message: 'Details updated successfully',
      data: response
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;