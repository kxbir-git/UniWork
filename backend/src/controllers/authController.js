const jwt = require('jsonwebtoken');
const { User, Wallet } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'uniwork_secret_key_2026', {
    expiresIn: '30d',
  });
};

// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, location } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const isClient = role === 'client';
    const isFreelancer = role === 'freelancer';

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isClient,
      isFreelancer,
      location: location || 'Campus / Remote',
      clientProfile: isClient ? { companyName: `${firstName}'s Team`, totalSpent: 0 } : {},
      freelancerProfile: isFreelancer ? { title: 'University Student & Freelancer', hourlyRate: 25, connects: 20 } : {},
    });

    const wallet = await Wallet.create({
      user: user._id,
      balance: isClient ? 1000 : 50,
      escrowHeld: 0,
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        roleLabel: user.roleLabel,
        isClient: user.isClient,
        isFreelancer: user.isFreelancer,
        isAdmin: user.isAdmin,
        location: user.location,
        clientProfile: user.clientProfile,
        freelancerProfile: user.freelancerProfile,
      },
      walletBalance: wallet.balance,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Authenticate user & get token
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: user._id, balance: 500, escrowHeld: 0 });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        roleLabel: user.roleLabel,
        isClient: user.isClient,
        isFreelancer: user.isFreelancer,
        isAdmin: user.isAdmin,
        location: user.location,
        profileImage: user.profileImage,
        clientProfile: user.clientProfile,
        freelancerProfile: user.freelancerProfile,
      },
      walletBalance: wallet.balance,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ user: req.user._id });

    res.json({
      success: true,
      user,
      wallet: wallet ? { balance: wallet.balance, escrowHeld: wallet.escrowHeld } : { balance: 0, escrowHeld: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { firstName, lastName, location, bio, clientProfile, freelancerProfile } = req.body;

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (location) updates.location = location;
    if (bio) updates.bio = bio;

    if (clientProfile && user.isClient) {
      updates.clientProfile = { ...user.clientProfile, ...clientProfile };
    }
    if (freelancerProfile && user.isFreelancer) {
      updates.freelancerProfile = { ...user.freelancerProfile, ...freelancerProfile };
    }

    const updated = await User.findByIdAndUpdate(user._id, updates);
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
