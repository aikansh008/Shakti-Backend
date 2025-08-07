const mongoose = require('mongoose');

const InsightsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true, // Optional: one cache per user
  },
  data: {
    type: Array,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  success: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('loanscheme', InsightsCacheSchema);
