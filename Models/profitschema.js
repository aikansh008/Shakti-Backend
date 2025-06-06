const mongoose = require('mongoose');

const ProfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: 'User' },
  monthlyProfits: { type: [Number], default: [] }, // Array of profits
});

module.exports = mongoose.model('Profit', ProfitSchema);
