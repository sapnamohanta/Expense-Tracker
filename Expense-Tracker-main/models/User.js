const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String
});

module.exports = mongoose.model('User', UserSchema);