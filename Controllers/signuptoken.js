const PersonalDetails = require('../Models/PersonalDetailSignup');
const UserCommunity = require('../Models/communityUser');
const BusinessIdeaDetails = require('../Models/BusinessDetailSignup');

const createCommunityUserFromToken = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('User ID from token:', userId);

    const existingUser = await PersonalDetails.findById(userId);
    const buisness = await BusinessIdeaDetails.findOne({ userId: userId });
const array = [
  buisness?.ideaDetails?.Business_Sector, 
  buisness?.ideaDetails?.Buisness_City, 
  buisness?.ideaDetails?.Target_Market,
];

    
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newUser = new UserCommunity({
      name: existingUser.personalDetails.Full_Name,
      email: existingUser.personalDetails.Email,
      businessIdea: buisness.ideaDetails?.Business_Sector || 'Not specified',
       interestTags: array ||  [],

    });

    await newUser.save();

    res.status(201).json({
      message: 'Community user created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        businessIdea: newUser.businessIdea,
        // interestTags: newUser.interestTags/,
      },
    });
  } catch (err) {
    console.error('Create community user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Export only the function (for single-function file)
module.exports = createCommunityUserFromToken;
