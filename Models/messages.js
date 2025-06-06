const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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