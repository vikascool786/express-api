const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    match: /.+\@.+\..+/,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;