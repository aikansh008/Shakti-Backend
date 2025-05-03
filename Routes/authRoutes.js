const express = require('express');
const router = express.Router();

const { loginUser } = require('../Controllers/authController');  // Import from the Controllers directory

router.post('/login', loginUser);

module.exports = router;
