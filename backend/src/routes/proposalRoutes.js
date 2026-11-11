const express = require('express');
const router = express.Router();
const { submitProposal, updateProposalStatus } = require('../controllers/proposalController');
const { protect, freelancerOnly, clientOnly } = require('../middleware/auth');

router.post('/', protect, freelancerOnly, submitProposal);
router.put('/:id/status', protect, clientOnly, updateProposalStatus);

module.exports = router;
