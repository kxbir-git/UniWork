const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
