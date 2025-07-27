const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: function() {
      return !this.file && !this.image;
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'document', 'audio', 'video'],
    default: 'text'
  },
  file: {
    url: String,
    originalName: String,
    size: Number,
    mimeType: String,
    cloudinaryId: String
  },
  image: {
    url: String,
    originalName: String,
    size: Number,
    cloudinaryId: String,
    thumbnail: String
  },
  seen: {
    type: Boolean,
    default: false
  },
  seenAt: {
    type: Date
  },
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  originalMessage: String,     
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedFor: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true 
});

// Index for better query performance
messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
messageSchema.index({ receiverId: 1, seen: 1 });

module.exports = mongoose.model('Message', messageSchema);