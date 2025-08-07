const mongoose = require('mongoose');

const InsightsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String, // Changed from Number to String to support "failed"
    enum: ['success', 'failed'], // optional, for stricter control
    default: 'success',
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // to allow any object or null
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InsightsCache', InsightsCacheSchema);
