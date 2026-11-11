const { Proposal, Job, Contract, Wallet, Transaction } = require('../models');

// @desc Submit proposal for a job (Freelancers only)
// @route POST /api/proposals
const submitProposal = async (req, res) => {
  try {
    const { jobId, coverLetter, bidAmount, estimatedDays } = req.body;

    if (!jobId || !coverLetter || !bidAmount) {
      return res.status(400).json({ success: false, message: 'Please provide job ID, cover letter, and bid amount' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting proposals' });
    }

    if (job.client.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot submit proposals for your own job' });
    }

    const existingProposal = await Proposal.findOne({ job: jobId, freelancer: req.user._id });
    if (existingProposal) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this job' });
    }

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount: Number(bidAmount),
      estimatedDays: Number(estimatedDays) || 7,
    });

    job.proposalsCount = (job.proposalsCount || 0) + 1;
    await job.save();

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get proposals for a specific job (Client owner only)
// @route GET /api/jobs/:id/proposals
const getJobProposals = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.client.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view proposals for this job' });
    }

    const proposals = await Proposal.find({ job: req.params.id })
      .populate('freelancer', 'firstName lastName email location freelancerProfile profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update proposal status (shortlist, accept, reject)
// @route PUT /api/proposals/:id/status
const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const job = proposal.job;
    if (job.client.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this proposal' });
    }

    proposal.status = status;
    await proposal.save();

    if (status === 'accepted') {
      let contract = await Contract.findOne({ job: job._id });
      if (!contract) {
        contract = await Contract.create({
          job: job._id,
          client: job.client,
          freelancer: proposal.freelancer,
          totalAmount: proposal.bidAmount,
          status: 'active',
          milestones: [
            {
              title: 'Phase 1: Project Architecture & Setup',
              description: 'Initial repo setup, architecture diagram, and core module setup.',
              amount: Math.round(proposal.bidAmount * 0.4),
              status: 'in_progress',
            },
            {
              title: 'Phase 2: Final Delivery & Evaluation',
              description: 'Complete project functionality, documentation, and handover.',
              amount: Math.round(proposal.bidAmount * 0.6),
              status: 'pending',
            },
          ],
        });

        job.status = 'in_progress';
        await job.save();

        let clientWallet = await Wallet.findOne({ user: job.client });
        if (clientWallet) {
          clientWallet.escrowHeld += proposal.bidAmount;
          if (clientWallet.balance >= proposal.bidAmount) {
            clientWallet.balance -= proposal.bidAmount;
          }
          await clientWallet.save();

          await Transaction.create({
            wallet: clientWallet._id,
            transactionType: 'escrow_lock',
            amount: -proposal.bidAmount,
            description: `Escrow hold for contract #${contract._id}: ${job.title}`,
            contractId: contract._id,
          });
        }
      }

      return res.json({ success: true, proposal, contractId: contract._id });
    }

    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitProposal, getJobProposals, updateProposalStatus };
