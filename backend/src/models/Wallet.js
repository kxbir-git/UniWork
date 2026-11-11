const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 1000.0, // Default simulated starter funds
  },
  escrowHeld: {
    type: Number,
    default: 0.0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
