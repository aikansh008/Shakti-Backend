const mongoose = require("mongoose");

const BudgetInsightsCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  insights: { type: Object },
  status: { type: Number }, // 200 or 500 or 404
}, { timestamps: true });

module.exports = mongoose.model("BudgetInsightsCache", BudgetInsightsCacheSchema);
