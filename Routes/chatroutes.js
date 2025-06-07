// routes/chat.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Send message
router.post('/send', authenticateToken, async (req, res) => {
  const { receiverId, message } = req.body;
  const newMessage = new Message({
    senderId: req.user.id,
    receiverId,
    message,
  });
  await newMessage.save();
  res.status(200).json(newMessage);
});

// Get chat between two users
router.get('/chat/:otherUserId', authenticateToken, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: req.params.otherUserId },
      { senderId: req.params.otherUserId, receiverId: req.user.id },
    ],
  }).sort('timestamp');
  res.status(200).json(messages);
});

module.exports = router;
