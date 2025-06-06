const express = require('express');
const router = express.Router();

// Import and use all sub-routes
const signupRoutes = require('./signupRoutes');
const authRoutes = require('./authRoutes');
const revenueRoutes= require('./monthlyRevenueRoutes');
const userRoutes= require('./getuserRoute');
const communityRoutes= require('./communityAuthRoutes');
const protectedRoute= require('./protectedusercommunity');
const postRoutes= require('./postRoutes')
const follow_unfollowRoutes= require('../Routes/follow_unfollowRoutes')

router.use('/api/signup', signupRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/revenue', revenueRoutes );
router.use('/api/details', userRoutes);
router.use('/api/community', communityRoutes);

// to check community user is authenticated
router.use('/api/protected', protectedRoute);

// community post
router.use('/api/post',postRoutes);


//Follow / Unfollow
router.use('/api/follow',follow_unfollowRoutes );
router.use('/api/unfollow',follow_unfollowRoutes );
router.use('/api/suggested', follow_unfollowRoutes );



module.exports = router;
