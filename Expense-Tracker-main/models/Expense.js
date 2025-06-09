const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userid: String,
  expenseid: String,
  category: String,
  description: String,
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
