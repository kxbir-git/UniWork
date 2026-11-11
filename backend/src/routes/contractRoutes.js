const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContractById,
  createMilestone,
  submitWork,
  approveMilestone,
} = require('../controllers/contractController');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect, clientOnly, freelancerOnly } = require('../middleware/auth');

router.get('/', protect, getContracts);
router.get('/:id', protect, getContractById);
router.post('/:id/milestones', protect, createMilestone);
router.post('/:id/milestones/:mId/submit', protect, freelancerOnly, submitWork);
router.post('/:id/milestones/:mId/approve', protect, clientOnly, approveMilestone);

// Message routes inside contract
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

module.exports = router;
