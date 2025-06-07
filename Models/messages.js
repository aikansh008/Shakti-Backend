const mongoose = require('mongoose');

<<<<<<< HEAD
const MessageSchema = new mongoose.Schema({
  senderId: {
=======
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
>>>>>>> master
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
<<<<<<< HEAD
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
=======
  text: {
    type: String,
  },
  file: {
    type: String, // file/image/document URL if any
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'document'],
    default: 'text'
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
>>>>>>> master
