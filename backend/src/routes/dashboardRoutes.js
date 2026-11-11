const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getClientDashboard,
  getFreelancerDashboard,
} = require('../controllers/dashboardController');
const { protect, clientOnly, freelancerOnly } = require('../middleware/auth');

router.get('/stats', getPlatformStats);
router.get('/client', protect, clientOnly, getClientDashboard);
router.get('/freelancer', protect, freelancerOnly, getFreelancerDashboard);

module.exports = router;
