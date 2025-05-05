const express = require('express');
const router = express.Router();

// Import the correct controller
const { loginUser } = require('../Controllers/authController');  // Import from the Controllers directory
const loginLimiter = require('../Middlewares/ratelimiter');

// POST route for login
router.post('/login',loginLimiter ,loginUser);

module.exports = router;
