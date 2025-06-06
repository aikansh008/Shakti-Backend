const express = require('express');
const mongoose = require('mongoose');
const Message = require('../Models/community/messages');
const requireAuth = require('../Middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId); // Extracted from JWT

    const recentUsers = await Message.aggregate([
      {
        $match: {
          senderId: userId  // Only messages sent by the current user
        }
      },
      {
        $sort: { timestamp: -1 } // Sort by most recent first
      },
      {
        $group: {
          _id: '$receiverId',               // Group by each receiver
          latestMessage: { $first: '$$ROOT' } // Pick latest message for each receiver
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',     // _id = receiverId
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id', // receiverId
          fullName: '$userInfo.fullName',
          profilePic: '$userInfo.profilePic',
          lastMessage: '$latestMessage.message',
          messageType: '$latestMessage.messageType',
          seen: '$latestMessage.seen',
          lastMessageTimestamp: '$latestMessage.timestamp'
        }
      },
      {
        $sort: { lastMessageTimestamp: -1 }
      }
    ]);

    res.status(200).json(recentUsers);
  } catch (err) {
    console.error('Error fetching messaged users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
