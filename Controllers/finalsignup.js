const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');
const FinancialDetails = require('../Models/FinancialDetailSignup');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const tempUsers = require('../tempUserStore');

const signup3User = async (req, res) => {
  try {
    const {
      sessionId,
      ideaDetails,
      financialPlan,
      operationalPlan
    } = req.body;

    // Validate required fields (null/undefined check for numeric fields)
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

    // Retrieve temporary user data
    const user = tempUsers.get(sessionId);
    if (!user) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Save PersonalDetails
    const newPersonal = new PersonalDetails({
      personalDetails: user.personalDetails,
      professionalDetails: user.professionalDetails,
      passwordDetails: {
        Password: user.passwordDetails.HashedPassword
      }
    });

    const savedPersonal = await newPersonal.save();

    // Save FinancialDetails
    const newFinancial = new FinancialDetails({
      userId: savedPersonal._id,
      ...user.FinancialDetails
    });

    await newFinancial.save();

    // Save BusinessIdeaDetails
    const newBusinessIdea = new BusinessIdeaDetails({
      sessionId: sessionId,
      userId: savedPersonal._id,
      ideaDetails,
      financialPlan,
      operationalPlan
    });

    const savedBusinessIdea = await newBusinessIdea.save();

    // // Save summary to SignupDB (optional summary DB)
    // const signupSummary = new SignupDB({
    //   personalDB: user.personalDetails,
    //   financialDB: user.FinancialDetails,
    //   businessDB: savedBusinessIdea
    // });

    // await signupSummary.save();

    // Cleanup temp storage
    tempUsers.delete(sessionId);

    res.status(201).json({
      message: 'Signup complete!',
      userId: savedPersonal._id
    });

  } catch (err) {
    console.error('Signup3 Error:', err);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { signup3User };
