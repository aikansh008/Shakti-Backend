const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const FinancialDetails = require('../Models/User/FinancialDetailSignup');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');
const tempUsers = require('../tempUserStore');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shakti1374@gmail.com',
    pass: 'zuyh rxns ybrr wihh' // Ideally store this securely in env variables
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

    // Check required fields from final step
    // Note: in schema, the field is "Buisness_Location" (typo), but here you check "Business_Location"
    // To fix mismatch, check for the typo as in schema:
    const requiredFields = [
      sessionId,
      ideaDetails?.Business_Name,
      ideaDetails?.Business_Sector,
      ideaDetails?.Buisness_Location,       // Use the typo field name here
      ideaDetails?.Business_City,
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

    if (requiredFields.some(field => !field)) {
      return res.status(400).json({ message: 'All business, financial, and operational fields are required!' });
    }

    // Ensure temp data from previous steps is present
    const user = tempUsers.get(sessionId);
    if (
      !user ||
      !user.personalDetails ||
      !user.professionalDetails ||
      !user.passwordDetails?.HashedPassword ||
      !user.FinancialDetails
    ) {
      return res.status(400).json({ message: 'Incomplete session data. Please complete all signup steps.' });
    }

    const email = user.personalDetails.Email;

    // Check if user already exists
    const existingUser = await PersonalDetails.findOne({ 'personalDetails.Email': email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email!' });
    }

    // Create and save personal details
    const newPersonal = new PersonalDetails({
      personalDetails: user.personalDetails,
      professionalDetails: user.professionalDetails,
      passwordDetails: { Password: user.passwordDetails.HashedPassword }
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
      sessionId,
      userId: savedPersonal._id,
      ideaDetails,
      financialPlan,
      operationalPlan
    });
    await newBusinessIdea.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedPersonal._id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { Full_Name } = user.personalDetails;

    // Prepare confirmation email
    const mailOptions = {
      from: 'shakti1374@gmail.com',
      to: email,
      subject: 'Congratulations on Signup!',
      text: `Hi ${Full_Name},\n\nCongratulations! Your signup is complete.\n\nThank you for joining us!\n\nRegards,\nTeam`
    };

    // Clear temp user data
    tempUsers.delete(sessionId);

    // Send confirmation email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Email Error:', error);
        return res.status(500).json({
          message: 'Signup complete, but confirmation email failed to send.',
          userId: savedPersonal._id,
          token
        });
      }

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
