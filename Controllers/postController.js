const Post= require('../Models/community/PostSchema');
const User = require('../Models/community/communityUser');


const createPost= async(req,res)=>{
  try{
    const {content, mediaUrl,interestTags}= req.body;
    if(!content) return res.status(400).json({message: "Post conntent is required"});

    const newPost= await Post.create({
      user: req.userId,
      content,
      mediaUrl,
      interestTags
    });

    res.status(201).json({message:'Post created', post: newPost});
  }catch(err){
    console.error('Post creation failed', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getPostsByInterest = async(req,res)=>{
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({
      interestTags: { $in: user.interestTags }
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Fetch posts failed", err);
    res.status(500).json({ message: "Server error" });
  }
};



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


const getFeedPosts = async (req, res) => {
  const { userId } = req;

  try {
    const user = await User.findById(userId);
    const followedUsers = user.following;

    const posts = await Post.find({ user: { $in: followedUsers } })
      .sort({ createdAt: -1 })
      .populate('user', 'name');

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};


module.exports= {
  createPost,
   getPostsByInterest,
  likePost,
commentOnPost,
getFeedPosts
};