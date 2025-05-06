// controllers/userController.js

const User = require('../Models/communityUser');

const followUser = async (req, res) => {
  const { userId } = req;  // logged-in user
  const { followId } = req.params;  // user to follow

  if (userId === followId) return res.status(400).json({ message: "Cannot follow yourself" });

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: followId }
    });
    await User.findByIdAndUpdate(followId, {
      $addToSet: { followers: userId }
    });
    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Follow failed" });
  }
};

const unfollowUser = async (req, res) => {
  const { userId } = req;
  const { followId } = req.params;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { following: followId }
    });
    await User.findByIdAndUpdate(followId, {
      $pull: { followers: userId }
    });
    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed" });
  }
};

module.exports={
  followUser,
  unfollowUser
}
