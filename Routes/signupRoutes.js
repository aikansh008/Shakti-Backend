const express = require('express');
const router = express.Router();

const { signupUser } = require("../Controllers/signupController");
const { signup2User } = require('../Controllers/signupController2');
const { signup3User } = require('../Controllers/finalsignup');

router.post('/signup1', signupUser);
router.post('/signup2', signup2User);
router.post('/signup3', signup3User);

module.exports = router;
