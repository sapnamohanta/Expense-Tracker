const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userid: String,
  incomeid: String,
  category: String,
  description: String,
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Income', IncomeSchema);
