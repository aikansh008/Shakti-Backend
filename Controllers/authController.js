const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/PersonalDetailSignup');

const loginUser = async (req, res) => {
  try {
    const { Full_Name, Password } = req.body;

    // Check if the user exists in the database
    const user = await PersonalDetails.findOne({ 'personalDetails.Full_Name': Full_Name });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(Password, user.passwordDetails.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

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
