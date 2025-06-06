const express = require('express');
const { createPost, getPostsByInterest, likePost, commentOnPost, updateComment, deleteComment } = require('../Controllers/postController');
const requireAuth = require('../Middlewares/authMiddleware');
const router = express.Router();

router.post('/create', requireAuth, createPost);
router.get('/Interestfeed', requireAuth, getPostsByInterest);
router.post('/L/:postId', requireAuth, likePost);
router.post('/C/:postId', requireAuth, commentOnPost);
router.put('/:postId/comments/:commentId', requireAuth, updateComment);
router.delete('/:postId/comments/:commentId', requireAuth, deleteComment);
module.exports = router;