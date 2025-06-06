const Post = require('../Models/PostSchema');
const BusinessIdeaDetails = require('../Models/User/BusinessDetailSignup');
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


const createPost = async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;
    if (!content) return res.status(400).json({ message: "Post content is required" });

    const newPost = await Post.create({
      user: req.userId,
      content,
      mediaUrl
    });

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    console.error('Post creation failed', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Posts by Matching Business Sector
const getPostsByInterest = async (req, res) => {
  try {
    const userId = req.userId;

    const userBusiness = await BusinessIdeaDetails.findOne({ userId });
    if (!userBusiness) {
      return res.status(404).json({ message: "Business idea not found" });
    }

    const businessSector = userBusiness.ideaDetails.Business_Sector;

    const matchingUsers = await BusinessIdeaDetails.find({
      "ideaDetails.Business_Sector": businessSector
    }).select('userId');

    const userIds = matchingUsers.map(user => user.userId);

    const posts = await Post.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 });

    const postsWithDetails = await Promise.all(posts.map(async post => {
      const fullName = await getFullNameByUserId(post.user);
      return {
        ...post.toObject(),
        userFullName: fullName,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
      };
    }));

    res.status(200).json(postsWithDetails);

  } catch (err) {
    console.error("Error fetching posts by business sector:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Like or Unlike a Post
const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId); // Unlike
    } else {
      post.likes.push(userId); // Like
    }

    await post.save();
    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    console.error("Like failed", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Comment on a Post
const commentOnPost = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  if (!text) return res.status(400).json({ message: "Comment text is required" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ text, postedBy: userId });
    await post.save();

    res.status(200).json({ message: "Comment added", post });
  } catch (err) {
    console.error("Comment failed", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  if (!text) return res.status(400).json({ message: "Updated text is required" });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.postedBy.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized to update this comment" });

    comment.text = text;
    await post.save();

    res.status(200).json({ message: "Comment updated", post });
  } catch (err) {
    console.error("Update failed", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.find(
      (c) => c._id.toString() === commentId
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if current user is the comment owner
    if (comment.postedBy.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Filter out the comment
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment failed:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// Get Feed Posts from Followed Users
const getFeedPosts = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await PersonalDetails.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const followedUsers = user.following;

    const posts = await Post.find({ user: { $in: followedUsers } })
      .sort({ createdAt: -1 });

    const postsWithNames = await Promise.all(posts.map(async post => {
      const fullName = await getFullNameByUserId(post.user);
      return {
        ...post.toObject(),
        userFullName: fullName
      };
    }));

    res.status(200).json(postsWithNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};

module.exports = {
  createPost,
  getPostsByInterest,
  likePost,
  commentOnPost,
  updateComment,
  deleteComment,
  getFeedPosts
};