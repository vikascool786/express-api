const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const tokenModel = mongoose.model('Token', tokenSchema);
module.exports = tokenModel;