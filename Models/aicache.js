// models/AiCache.js
const mongoose = require('mongoose');

const aiCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  requestType: { type: String, required: true },
  responseData: { type: Object },
  lastFetched: { type: Date, default: Date.now },
  status: { type: Number, default: 500 },
});

aiCacheSchema.index({ userId: 1, requestType: 1 }, { unique: true });

module.exports = mongoose.model('AiCache', aiCacheSchema);
