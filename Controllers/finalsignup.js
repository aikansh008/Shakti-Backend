const PersonalDetails = require('../Models/PersonalDetailSignup');
const FinancialDetails = require('../Models/FinancialDetailSignup');
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const tempUsers = require('../tempUserStore');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aikanshtiwari007@gmail.com',
    pass: 'zuyh rxns ybrr wihh'
  }
});

const signup3User = async (req, res) => {
  try {
    const {
      sessionId,
      ideaDetails,
      financialPlan,
      operationalPlan
    } = req.body;

    // Validate all required fields
    const requiredFields = [
      sessionId,
      ideaDetails?.Business_Name,
      ideaDetails?.Business_Sector,
      ideaDetails?.Business_Location,
      ideaDetails?.Idea_Description,
      ideaDetails?.Target_Market,
      ideaDetails?.Unique_Selling_Proposition,
      financialPlan?.Estimated_Startup_Cost,
      financialPlan?.Funding_Required,
      financialPlan?.Expected_Revenue_First_Year,
      operationalPlan?.Team_Size,
      operationalPlan?.Resources_Required,
      operationalPlan?.Timeline_To_Launch
    ];

    if (requiredFields.some(field => field === undefined || field === null)) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const user = tempUsers.get(sessionId);
    if (!user) {
      return res.status(404).json({ message: 'Session not found!' });
    }

    const email = user.personalDetails.Email;

    // ✅ Check if email already exists
    const existingUser = await PersonalDetails.findOne({ 'personalDetails.Email': email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email!' });
    }

    // Save personal details
    const newPersonal = new PersonalDetails({
      personalDetails: user.personalDetails,
      professionalDetails: user.professionalDetails,
      passwordDetails: {
        Password: user.passwordDetails.HashedPassword
      }
    });

    const savedPersonal = await newPersonal.save();

    // Save financial details
    const newFinancial = new FinancialDetails({
      userId: savedPersonal._id,
      ...user.FinancialDetails
    });
    await newFinancial.save();

    // Save business idea details
    const newBusinessIdea = new BusinessIdeaDetails({
      sessionId: sessionId,
      userId: savedPersonal._id,
      ideaDetails,
      financialPlan,
      operationalPlan
    });
    await newBusinessIdea.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedPersonal._id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { Full_Name } = user.personalDetails;

    const mailOptions = {
      from: 'aikanshtiwari007@gmail.com',
      to: email,
      subject: 'Congratulations on Signup!',
      text: `Hi ${Full_Name},\n\nCongratulations! Your signup is complete.\n\nThank you for joining us!\n\nRegards,\nTeam`
    };

    // Delete temp session
    tempUsers.delete(sessionId);

    // Send confirmation email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
          message: 'Signup completed, but email failed.',
          userId: savedPersonal._id,
          token
        });
      }

      console.log('Email sent:', info.response);
      return res.status(201).json({
        message: 'Signup complete and confirmation email sent!',
        userId: savedPersonal._id,
        token
      });
    });

  } catch (err) {
    console.error('Signup3 Error:', err);
    return res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup3User };
