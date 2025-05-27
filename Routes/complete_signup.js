const express = require('express');
const { v4: uuidv4 } = require('uuid');
const tempUsers = require('../tempUserStore'); // In-memory Map or object
const requireAuth = require('../Middlewares/authMiddleware'); // JWT middleware

const router = express.Router();

router.post('/personal-details', requireAuth, (req, res) => {
  try {
    const {
      Preferred_Languages,
      age,
      gender,
      Business_Experience,
      Educational_Qualifications,
      Password
    } = req.body;

    // ✅ Get name and email from JWT token
    const { name, email } = req.user;

    // Simple validation
    if (!name || !email || !Preferred_Languages || !Business_Experience || !Educational_Qualifications || !Password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Generate unique sessionId for this user session
    const sessionId = uuidv4();

    // Store personal + professional + password details temporarily with sessionId key
    tempUsers.set(sessionId, {
      personalDetails: {
        Full_Name: name,
        Email: email,
        Preferred_Languages,
        age,
        gender
      },
      professionalDetails: {
        Business_Experience,
        Educational_Qualifications
      },
      passwordDetails: {
        Password
      }
    });

    return res.status(200).json({
      message: "Personal details saved temporarily",
      sessionId
    });

  } catch (error) {
    console.error("Error saving personal details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
