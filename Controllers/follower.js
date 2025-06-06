const Follow = require('../Models/community/followers');
const mongoose = require("mongoose");
const PersonalDetails = require('../Models/User/PersonalDetailSignup');


const getFullNameByUserId = async (userId) => {
  try {
    const user = await PersonalDetails.findById(userId).select('personalDetails.Full_Name');
    return user?.personalDetails?.Full_Name || null;
  } catch (error) {
    console.error('Error fetching user full name:', error);
    return null;
  }
};

const followUser = async (req, res) => {
  const { userId } = req;  // logged-in user
  const { followId } = req.params;

  if (userId === followId) return res.status(400).json({ message: "Cannot follow yourself" });

  try {
    // Get full names of both users
    const myName = await getFullNameByUserId(userId);
    const followUserName = await getFullNameByUserId(followId);

    if (!myName || !followUserName) {
      return res.status(404).json({ message: "User name not found" });
    }

    // Add to my "following" list
    await Follow.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        fullName: myName,
        $addToSet: {
          following: {
            userId: followId,
            fullName: followUserName
          }
        }
      },
      { upsert: true, new: true }
    );

    // Add to their "followers" list
    await Follow.findOneAndUpdate(
      { user: followId },
      {
        user: followId,
        fullName: followUserName,
        $addToSet: {
          followers: {
            userId: userId,
            fullName: myName
          }
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Followed successfully",
      followedUser: {
        userId: followId,
        fullName: followUserName
      }
    });

  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: "Follow failed", details: err.message });
  }
};


const unfollowUser = async (req, res) => {
  const { userId } = req;
  const { followId } = req.params;

  try {
    await Follow.findOneAndUpdate(
      { user: userId },
      { $pull: { following: followId } }
    );

    await Follow.findOneAndUpdate(
      { user: followId },
      { $pull: { followers: userId } }
    );

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed", details: err.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserFollow = await Follow.findOne({ user: req.userId });

    const excludedIds = currentUserFollow ? currentUserFollow.following : [];

    const suggested = await User.find({
      _id: { $nin: [...excludedIds, req.userId] }
    })
      .select('name email businessIdea')
      .limit(10);

    res.status(200).json(suggested);
  } catch (error) {
    res.status(500).json({ message: "Failed to get suggestions", error });
  }
};

// ✅ Get list of users with followers/following info
const getFollowersAndFollowing = async (req, res) => {
  try {
    const userId = req.userId; // from JWT middleware

    const followData = await Follow.findOne({ user: userId });

    if (!followData) {
      return res.status(404).json({ message: "No followers/following data found" });
    }

    // Directly extract userId and fullName from the array
    const followingUsers = followData.following.map(({ userId, fullName }) => ({
      userId,
      fullName
    }));

    const followerUsers = followData.followers.map(({ userId, fullName }) => ({
      userId,
      fullName
    }));

    res.status(200).json({
      followers: followerUsers,
      following: followingUsers
    });

  } catch (error) {
    console.error("Error in followers_following:", error);
    res.status(500).json({
      message: "Error fetching followers data",
      error: error.message || error.toString(),
    });
  }
};



module.exports = {
  followUser,
  unfollowUser,
  getSuggestedUsers,
  getFollowersAndFollowing
};