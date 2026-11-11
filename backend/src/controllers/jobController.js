const { Job, Proposal } = require('../models');

// @desc Get all jobs with filters & search
// @route GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { q, category, budgetType, experienceLevel, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['open', 'in_progress'] };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (budgetType) {
      query.budgetType = budgetType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('client', 'firstName lastName email location clientProfile profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single job by ID
// @route GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let userProposal = null;
    if (req.user) {
      userProposal = await Proposal.findOne({ job: job._id, freelancer: req.user._id });
    }

    res.json({ success: true, job, userProposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new job (Clients only)
// @route POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, description, category, budgetType, budgetMin, budgetMax, experienceLevel, skillsRequired } = req.body;

    if (!title || !description || !budgetMin) {
      return res.status(400).json({ success: false, message: 'Title, description, and budget are required' });
    }

    const skills = Array.isArray(skillsRequired)
      ? skillsRequired
      : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []);

    const job = await Job.create({
      client: req.user._id,
      title,
      description,
      category: category || 'Software Development',
      budgetType: budgetType || 'fixed',
      budgetMin: Number(budgetMin),
      budgetMax: budgetMax ? Number(budgetMax) : Number(budgetMin),
      experienceLevel: experienceLevel || 'entry',
      skillsRequired: skills,
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update job
// @route PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.client.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true, job: updatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob };
