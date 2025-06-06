const express = require('express');
const { communitysignup } = require('../Controllers/communityAuthController');
const { communitylogin } = require('../Controllers/loginCommunityuser');
const  createCommunityUserFromToken  = require('../Controllers/signuptoken');
const  requireAuth  = require('../Middlewares/authMiddleware');

const router =express.Router();

router.post('/signup', communitysignup);
router.post('/login', communitylogin);
router.get('/test', (req, res) => {
    console.log('Community test route hit');
    res.send('Community test route hit');
});


router.post('/create', requireAuth, createCommunityUserFromToken);
module.exports = router;