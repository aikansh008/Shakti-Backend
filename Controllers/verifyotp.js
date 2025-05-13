
const tempUsers = require("../tempUserStore");

const verifyOtp = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    // Check if sessionId and OTP are provided in the request body
    if (!sessionId || !otp) {
      return res.status(400).json({ message: "Session ID and OTP are required." });
    }

    // Get the temporary user associated with the sessionId
    const tempUser = tempUsers.get(sessionId);

    // Check if the session is valid (user exists)
    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired session ID." });
    }

    // Check if OTP has expired based on expiresAt field
    if (tempUser.expiresAt && new Date() > new Date(tempUser.expiresAt)) {
      tempUsers.delete(sessionId); // Cleanup expired session
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check if the OTP is correct
    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // Mark the user as verified
    tempUser.verified = true;

    // Save the updated session data
    tempUsers.set(sessionId, tempUser);

    // Return success response
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    // Log the error and return a server error message
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ message: "Server error during OTP verification." });
  }
};

module.exports = { verifyOtp };

