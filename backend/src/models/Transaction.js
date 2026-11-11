const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'escrow_lock', 'escrow_release', 'fee'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    default: null,
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
