const express = require('express');
const router = express.Router();
const { signupUser } = require('../Controllers/signupController');
const { signup2User } = require('../Controllers/signupController2');

// POST route for user signup
router.post('/', signupUser);
router.post('/2', signup2User);

module.exports = router;
