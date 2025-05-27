const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const generateToken = require('../Middlewares/generatejwt');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/google/token
router.post('/token', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'Missing ID token' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // ⚠ Do NOT save to DB here.
    const token = generateToken({ email, name, googleId });

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
});

module.exports = router;
