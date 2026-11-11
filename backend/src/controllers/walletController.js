const { Wallet, Transaction } = require('../models');

// @desc Get current user wallet and transaction ledger
// @route GET /api/wallet
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 1000, escrowHeld: 0 });
    }

    const transactions = await Transaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        escrowHeld: wallet.escrowHeld,
      },
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Deposit simulated funds
// @route POST /api/wallet/deposit
const depositFunds = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount' });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0, escrowHeld: 0 });
    }

    wallet.balance += depositAmount;
    await wallet.save();

    const transaction = await Transaction.create({
      wallet: wallet._id,
      transactionType: 'deposit',
      amount: depositAmount,
      description: description || 'Simulated fund top-up',
    });

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        escrowHeld: wallet.escrowHeld,
      },
      transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWallet, depositFunds };
