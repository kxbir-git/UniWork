const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uniwork_secret_key_2026');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

const clientOnly = (req, res, next) => {
  if (req.user && req.user.isClient) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Client role required' });
};

const freelancerOnly = (req, res, next) => {
  if (req.user && req.user.isFreelancer) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Freelancer role required' });
};

module.exports = { protect, clientOnly, freelancerOnly };
