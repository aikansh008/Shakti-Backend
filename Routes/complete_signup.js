const express = require('express');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const requireAuth = require('../Middlewares/authMiddleware');

const router = express.Router();

router.post('/complete-profile', requireAuth, async (req, res) => {
  try {
    const userId = req.userId;  // userId from JWT

    const { personalDetails, professionalDetails, passwordDetails } = req.body;

    // Find user by userId only
    const user = await PersonalDetails.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract email from user data in DB
    const userEmail = user.personalDetails.Email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email missing in DB" });
    }

    // Update profile fields carefully
    if (personalDetails) {
      const updatedPersonalDetails = {
        ...user.personalDetails.toObject(),
        ...personalDetails,
      };

      // Keep original email from DB regardless of input to avoid duplicates
      updatedPersonalDetails.Email = userEmail;
      user.personalDetails = updatedPersonalDetails;
    }

    if (professionalDetails) {
      user.professionalDetails = {
        ...user.professionalDetails.toObject(),
        ...professionalDetails,
      };
    }

    if (passwordDetails) {
      user.passwordDetails = {
        ...user.passwordDetails.toObject(),
        ...passwordDetails,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern["personalDetails.Email"]) {
      return res.status(400).json({
        message: "Email already exists. Please use a different email.",
        error,
      });
    }
    res.status(500).json({ message: "Error updating profile", error });
  }
});

module.exports = router;
