const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserCommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  businessIdea: {
    type: String,
    required: true
  },
  interestTags: {
    type: [String],
    default: []
  },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });


UserCommunitySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('UserCommunity', UserCommunitySchema);
