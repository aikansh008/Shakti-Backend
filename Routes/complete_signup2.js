const express = require('express');
const tempUsers = require('../tempUserStore');

const router = express.Router();

router.post('/business-details', (req, res) => {
  try {
    const { sessionId, ideaDetails, financialPlan, operationalPlan } = req.body;

    // Validate session
    const tempUser = tempUsers.get(sessionId);
    if (!tempUser) {
      return res.status(400).json({ message: 'Invalid or expired session ID' });
    }

    // Validate fields
    if (
      !ideaDetails?.Business_Name ||
      !ideaDetails?.Business_Sector ||
      !ideaDetails?.Buisness_City ||
      !ideaDetails?.Business_Location ||
      !ideaDetails?.Idea_Description ||
      !ideaDetails?.Target_Market ||
      !ideaDetails?.Unique_Selling_Proposition ||
      !financialPlan?.Estimated_Startup_Cost ||
      !financialPlan?.Funding_Required ||
      !financialPlan?.Expected_Revenue_First_Year ||
      !operationalPlan?.Team_Size ||
      !operationalPlan?.Resources_Required ||
      !operationalPlan?.Timeline_To_Launch
    ) {
      return res.status(400).json({ message: 'All business fields are required' });
    }

    // Store business idea in session
    tempUser.businessDetails = {
      ideaDetails,
      financialPlan,
      operationalPlan
    };

    tempUsers.set(sessionId, tempUser);

    res.status(200).json({ message: 'Business details saved successfully' });
  } catch (err) {
    console.error('Error saving business details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;