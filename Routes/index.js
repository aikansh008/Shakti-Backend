const express = require('express');
const router = express.Router();

// Import and use all sub-routes
const signupRoutes = require('./signupRoutes');
const authRoutes = require('./authRoutes');

router.use('/api/signup', signupRoutes);
router.use('/api/auth', authRoutes);

module.exports = router;
