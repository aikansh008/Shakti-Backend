const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,  // ✅ needed
      name: user.personalDetails?.Full_Name || user.name || '', // ✅ add name
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = generateToken;
