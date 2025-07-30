const mongoose = require('mongoose');

const SearchResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // To associate results with a user
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  snippet: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['report', 'study', 'draft', 'ban', 'outlook', 'waste', 'other'],
    default: 'other',
  },
  source: {
    type: String,
    default: 'unknown',
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SearchResult', SearchResultSchema);
