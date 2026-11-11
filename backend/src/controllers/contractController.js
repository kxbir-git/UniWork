const { Contract, Wallet, Transaction, Message, User } = require('../models');

// @desc Get user's contracts
// @route GET /api/contracts
const getContracts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    };

    if (status) {
      query.status = status;
    }

    const contracts = await Contract.find(query)
      .populate('job', 'title category budgetType')
      .populate('client', 'firstName lastName email clientProfile profileImage')
      .populate('freelancer', 'firstName lastName email freelancerProfile profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: contracts.length, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single contract workroom details
// @route GET /api/contracts/:id
const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isClient = contract.client._id.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer._id.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this contract room' });
    }

    res.json({ success: true, contract, isClient, isFreelancer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add a new milestone to contract
// @route POST /api/contracts/:id/milestones
const createMilestone = async (req, res) => {
  try {
    const { title, description, amount, dueDate } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    contract.milestones.push({
      _id: require('../mockDb').generateId(),
      title,
      description: description || '',
      amount: Number(amount),
      dueDate: dueDate || null,
      status: 'pending',
      isApproved: false,
      submissions: [],
    });

    await contract.save();
    res.status(201).json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Submit work for a milestone
// @route POST /api/contracts/:id/milestones/:mId/submit
const submitWork = async (req, res) => {
  try {
    const { workNotes, attachmentUrl } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    milestone.submissions.push({
      freelancer: req.user._id,
      workNotes: workNotes || 'Deliverable uploaded for review.',
      attachmentUrl: attachmentUrl || '',
      submittedAt: new Date(),
    });

    milestone.status = 'submitted';
    await contract.save();

    await Message.create({
      contract: contract._id,
      sender: req.user._id,
      content: `[DELIVERABLE SUBMITTED] ${req.user.displayName} submitted work for milestone "${milestone.title}". Notes: ${workNotes}`,
      isSystem: true,
    });

    res.json({ success: true, contract, milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve milestone deliverable and release funds
// @route POST /api/contracts/:id/milestones/:mId/approve
const approveMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (contract.client._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the client can approve deliverables' });
    }

    const milestone = contract.milestones.id(req.params.mId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    if (milestone.isApproved) {
      return res.status(400).json({ success: false, message: 'Milestone is already approved' });
    }

    milestone.isApproved = true;
    milestone.status = 'approved';
    contract.amountPaid = (contract.amountPaid || 0) + milestone.amount;

    const allApproved = contract.milestones.every(m => m.isApproved);
    if (allApproved) {
      contract.status = 'completed';
    }

    await contract.save();

    let freelancerWallet = await Wallet.findOne({ user: contract.freelancer._id || contract.freelancer });
    if (!freelancerWallet) {
      freelancerWallet = await Wallet.create({ user: contract.freelancer._id || contract.freelancer, balance: 0, escrowHeld: 0 });
    }
    freelancerWallet.balance += milestone.amount;
    await freelancerWallet.save();

    let clientWallet = await Wallet.findOne({ user: contract.client._id || contract.client });
    if (clientWallet && clientWallet.escrowHeld >= milestone.amount) {
      clientWallet.escrowHeld -= milestone.amount;
      await clientWallet.save();
    }

    await Transaction.create({
      wallet: freelancerWallet._id,
      transactionType: 'escrow_release',
      amount: milestone.amount,
      description: `Payment received for approved milestone "${milestone.title}" on contract #${contract._id}`,
      contractId: contract._id,
      milestoneId: milestone._id,
    });

    await User.findByIdAndUpdate(contract.freelancer._id || contract.freelancer, {
      $inc: {
        'freelancerProfile.totalEarned': milestone.amount,
        'freelancerProfile.completedJobsCount': allApproved ? 1 : 0,
      },
    });

    await User.findByIdAndUpdate(contract.client._id || contract.client, {
      $inc: { 'clientProfile.totalSpent': milestone.amount },
    });

    await Message.create({
      contract: contract._id,
      sender: req.user._id,
      content: `[ESCROW RELEASED] Client approved milestone "${milestone.title}". $${milestone.amount} has been credited to freelancer's wallet.`,
      isSystem: true,
    });

    res.json({ success: true, contract, milestone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getContracts, getContractById, createMilestone, submitWork, approveMilestone };
