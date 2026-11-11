const express = require('express');
const router = express.Router();
const { getWallet, depositFunds } = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getWallet);
router.post('/deposit', protect, depositFunds);

module.exports = router;
