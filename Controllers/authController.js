const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const loginLimiter  = require('../Middlewares/ratelimiter');
const tempUsers = require('../tempUserStore');

const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const ipAddress = req.ip; // Get the user's IP address

    // Implement the rate limit and IP block logic
    if (tempUsers.has(ipAddress)) {
      const userData = tempUsers.get(ipAddress);

      if (userData.count >= 5 && Date.now() - userData.lastAttempt < 60000) {
        return res.status(429).json({ message: "Too many login attempts. Please try again later." });
      }

      if (userData.count >= 5 && Date.now() - userData.lastAttempt > 60000) {
        tempUsers.delete(ipAddress); // Reset count after 1 minute
      }
    }

    // Check if the user exists in the database
    const user = await PersonalDetails.findOne({ 'personalDetails.Email': Email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(Password, user.passwordDetails.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Track login attempt (for rate limiting)
    tempUsers.set(ipAddress, { count: (tempUsers.get(ipAddress)?.count || 0) + 1, lastAttempt: Date.now() });

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the client
    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { loginUser };
