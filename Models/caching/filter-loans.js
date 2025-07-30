const mongoose = require("mongoose");

const LoanSchemeCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  schemes: { type: Array, required: false },
  status: { type: Number, default: 200 }, // 200 OK, 500 error etc.
});

module.exports = mongoose.model("LoanSchemeCache", LoanSchemeCacheSchema);
