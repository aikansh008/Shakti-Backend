const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true,
  },
  lastMessage: {
    type: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
