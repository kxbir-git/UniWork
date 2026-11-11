const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob } = require('../controllers/jobController');
const { getJobProposals } = require('../controllers/proposalController');
const { protect, clientOnly } = require('../middleware/auth');

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, clientOnly, createJob);
router.put('/:id', protect, clientOnly, updateJob);
router.get('/:id/proposals', protect, clientOnly, getJobProposals);

module.exports = router;
