const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const generateToken = require('../Middlewares/generatejwt');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Passport strategy without OTP logic
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/googleauth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName || '';

    // ✅ Don't fetch or save user in DB — just pass basic info forward
    const user = {
      name,
      email,
      googleId: profile.id
    };

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));



router.use(passport.initialize());

// Step 1: Trigger Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Handle callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Auth error' });

    if (!user) {
      return res.status(400).json({ message: info?.message || 'Authentication failed' });
    }

    // ✅ Generate token with only minimal Google info
    const token = generateToken({
      email: user.email,
      name: user.name,
      googleId: user.googleId
    });

    return res.status(200).json({ token, user });
  })(req, res, next);
});

module.exports = router;
