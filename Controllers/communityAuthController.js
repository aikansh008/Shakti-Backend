const User = require('../Models/community/communityUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const communitysignup = async (req, res) => {
  try {
    const { name, email, password, businessIdea, interestTags } = req.body;

    if (!name || !email || !password || !businessIdea) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const newUser = new User({
      name,
      email,
      password,
      businessIdea,
      interestTags: interestTags || []
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        businessIdea: newUser.businessIdea,
        interestTags: newUser.interestTags
      }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { communitysignup };
