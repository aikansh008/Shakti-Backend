const express = require('express');
const router = express.Router();

// Import the correct controller
const { loginUser } = require('../Controllers/authController');  // Import from the Controllers directory

// POST route for login
router.post('/login', loginUser);

module.exports = router;
