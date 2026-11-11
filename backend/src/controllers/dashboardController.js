const { Job, User, Contract, Proposal, Wallet, Transaction } = require('../models');

// @desc Get public platform stats for homepage
// @route GET /api/dashboard/stats
const getPlatformStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeFreelancers = await User.countDocuments({ isFreelancer: true });
    const activeClients = await User.countDocuments({ isClient: true });
    const completedContracts = await Contract.countDocuments({ status: 'completed' });

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeFreelancers,
        activeClients,
        completedContracts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get client dashboard data
// @route GET /api/dashboard/client
const getClientDashboard = async (req, res) => {
  try {
    const postedJobs = await Job.find({ client: req.user._id });
    const activeJobsCount = postedJobs.filter(j => j.status === 'open').length;

    const jobIds = postedJobs.map(j => j._id);
    const pendingProposalsCount = await Proposal.countDocuments({
      job: { $in: jobIds },
      status: 'pending',
    });

    const activeContracts = await Contract.find({ client: req.user._id, status: 'active' });

    const wallet = await Wallet.findOne({ user: req.user._id }) || { balance: 0, escrowHeld: 0 };
    const recentTransactions = await Transaction.find({ wallet: wallet._id });

    res.json({
      success: true,
      data: {
        activeJobsCount,
        pendingProposalsCount,
        activeContracts,
        postedJobs,
        wallet,
        recentTransactions: recentTransactions.sort ? recentTransactions.sort().limit(5) : [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get freelancer dashboard data
// @route GET /api/dashboard/freelancer
const getFreelancerDashboard = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id });
    const activeProposalsCount = proposals.filter(p => p.status === 'pending').length;

    const activeContracts = await Contract.find({ freelancer: req.user._id, status: 'active' });

    const wallet = await Wallet.findOne({ user: req.user._id }) || { balance: 0, escrowHeld: 0 };
    const recentTransactions = await Transaction.find({ wallet: wallet._id });

    res.json({
      success: true,
      data: {
        activeProposalsCount,
        proposals,
        activeContracts,
        wallet,
        recentTransactions: recentTransactions.sort ? recentTransactions.sort().limit(5) : [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlatformStats, getClientDashboard, getFreelancerDashboard };
