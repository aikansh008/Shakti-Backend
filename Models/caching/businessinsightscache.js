const mongoose = require("mongoose");

const insightsCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // formatted date: 'YYYY-MM-DD'
  status: { type: Number, required: true }, // e.g., 200, 500
  insights: { type: mongoose.Schema.Types.Mixed }, // JSON from Gemini
}, { timestamps: true });

insightsCacheSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("InsightsCache", insightsCacheSchema);