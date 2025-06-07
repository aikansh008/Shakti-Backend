const mongoose = require('mongoose');

const userRefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  }
}, 
{ _id: false });

const followSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {                       // 👈 Add this field
    type: String,
    required: true
  },
  following: [userRefSchema],
  followers: [userRefSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Follow', followSchema);