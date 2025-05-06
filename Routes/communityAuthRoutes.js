const express = require('express');
const { communitysignup } = require('../Controllers/communityAuthController');
const { communitylogin } = require('../Controllers/loginCommunityuser');
const router = express.Router();


router.post('/signup', communitysignup);
router.post('/login', communitylogin);

module.exports = router;
