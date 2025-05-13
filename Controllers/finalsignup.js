const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const FinancialDetails = require('../Models/FinancialDetailSignup');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const tempUsers = require('../tempUserStore');
const nodemailer = require('nodemailer'); // Ensure this is imported

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aikanshtiwari007@gmail.com',
    pass: 'ylfj vbrx tpdb efke' // Use app-specific password
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

    // Validate required fields
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

    // Get user from temp store
    const user = tempUsers.get(sessionId);
    if (!user) {
      return res.status(404).json({ message: 'Session not found' });
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
      ...user.FinancialDetails // If you store any in tempUsers
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

    // Extract email and name from temp user
    const { Email, Full_Name } = user.personalDetails;

    // Send congratulatory email
    const mailOptions = {
      from: 'aikanshtiwari007@gmail.com',
      to: Email,
      subject: 'Congratulations',
      text: `Hi ${Full_Name},\n\nCongratulations! Your signup is complete.\n\nThank you for joining us!\n\nRegards,\nTeam`
    };

    // Delete temp session data
    tempUsers.delete(sessionId);

    // Send mail and respond once
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
          message: 'Signup completed, but failed to send confirmation email.',
          userId: savedPersonal._id
        });
      }

      console.log('Confirmation email sent:', info.response);
      return res.status(201).json({
        message: 'Signup complete and confirmation email sent!',
        userId: savedPersonal._id
      });
    });

  } catch (err) {
    console.error('Signup3 Error:', err);
    return res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup3User };
