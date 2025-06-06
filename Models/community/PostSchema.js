const mongoose= require('mongoose');

const commentSchema= new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCommunity', required: true },
  text: { type: String, required: true},
  createdAt:{type: Date,default:Date.now}
});

const postSchema= new mongoose.Schema({
  user:{type: mongoose.Schema.Types.ObjectId, ref:'UserCommunity', required:true},
  content:{type: String, required:true},
  mediaUrl:{type: String},
  interestTags: [String],
  likes:[{type: mongoose.Schema.Types.ObjectId, ref:'UserCommunity'}],
  comments: [ {
    text: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {timestamps: true});

module.exports= mongoose.model('Post',postSchema);