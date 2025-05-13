const express = require('express');
const router = express.Router();

// Import the correct controller
const  {loginUser } = require('../Controllers/authController');  // Import from the Controllers directory
const loginLimiter= require('../Middlewares/ratelimiter');
const {signupUser}= require('../Controllers/signupController');
const {signup2User}= require('../Controllers/signupController2');
const {signup3User}= require('../Controllers/finalsignup');
const {verifyOtp}= require('../Controllers/verifyotp');
const {resendOtp}= require('../Routes/resendotp');
// POST route for login
router.post('/login',loginLimiter ,loginUser);
router.post('/signup1', signupUser); 
router.post('/signup2', signup2User);
router.post('/signup3', signup3User);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
module.exports = router;