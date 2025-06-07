const express = require('express');
const router = express.Router();
const requireAuth = require('../Middlewares/authMiddleware');

// Mongoose models
const User = require('../Models/User/PersonalDetailSignup');
const Business = require('../Models/User/BusinessDetailSignup');
const Financial = require('../Models/User/FinancialDetailSignup');
const Follow = require('../Models/community/followers');

// Get current user's profile
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select('-password');
    const businessDetails = await Business.findOne({ userId });
    const financialDetails = await Financial.findOne({ userId });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      user,
      businessDetails,
      financialDetails,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (excluding current user)
router.get('/all-users', requireAuth, async (req, res) => {
  const currentUserId = req.userId;

  try {
    const users = await User.find({ _id: { $ne: currentUserId } }).select('personalDetails');

    const getFollowCounts = async (userId) => {
      const followData = await Follow.findOne({ user: userId });
      return {
        followersCount: followData?.followers?.length || 0,
        followingCount: followData?.following?.length || 0,
      };
    };

    const usersWithFollowCounts = await Promise.all(
      users.map(async (user) => {
        const { followersCount, followingCount } = await getFollowCounts(user._id);
        return {
          id: user._id,
          fullName: user.personalDetails.Full_Name,
          email: user.personalDetails.Email,
          followersCount,
          followingCount,
        };
      })
    );

    res.status(200).json({ users: usersWithFollowCounts });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get followers of current user
router.get('/followers', requireAuth, async (req, res) => {
  const currentUserId = req.userId;

  try {
    const followData = await Follow.findOne({ user: currentUserId });

    if (!followData || !followData.followers?.length) {
      return res.status(200).json({ followers: [] });
    }

    const getFollowCounts = async (userId) => {
      const followData = await Follow.findOne({ user: userId });
      return {
        followersCount: followData?.followers?.length || 0,
        followingCount: followData?.following?.length || 0,
      };
    };

    const followersWithDetails = await Promise.all(
      followData.followers.map(async (follower) => {
        try {
          const userDetails = await User.findById(follower.userId).select('personalDetails');
          const { followersCount, followingCount } = await getFollowCounts(follower.userId);

          return {
            id: follower.userId,
            fullName: userDetails?.personalDetails?.Full_Name || follower.fullName,
            email: userDetails?.personalDetails?.Email || 'Email not found',
            followersCount,
            followingCount,
          };
        } catch (error) {
          console.error(`Error fetching details for follower ${follower.userId}:`, error);
          return {
            id: follower.userId,
            fullName: follower.fullName,
            email: 'Email not found',
            followersCount: 0,
            followingCount: 0,
          };
        }
      })
    );

    res.status(200).json({
      followers: followersWithDetails,
      totalFollowers: followersWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get following users of current user
router.get('/following', requireAuth, async (req, res) => {
  const currentUserId = req.userId;

  try {
    const followData = await Follow.findOne({ user: currentUserId });

    if (!followData || !followData.following?.length) {
      return res.status(200).json({ following: [] });
    }

    const getFollowCounts = async (userId) => {
      const followData = await Follow.findOne({ user: userId });
      return {
        followersCount: followData?.followers?.length || 0,
        followingCount: followData?.following?.length || 0,
      };
    };

    const followingWithDetails = await Promise.all(
      followData.following.map(async (following) => {
        try {
          const userDetails = await User.findById(following.userId).select('personalDetails');
          const { followersCount, followingCount } = await getFollowCounts(following.userId);

          return {
            id: following.userId,
            fullName: userDetails?.personalDetails?.Full_Name || following.fullName,
            email: userDetails?.personalDetails?.Email || 'Email not found',
            followersCount,
            followingCount,
          };
        } catch (error) {
          console.error(`Error fetching details for following ${following.userId}:`, error);
          return {
            id: following.userId,
            fullName: following.fullName,
            email: 'Email not found',
            followersCount: 0,
            followingCount: 0,
          };
        }
      })
    );

    res.status(200).json({
      following: followingWithDetails,
      totalFollowing: followingWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
