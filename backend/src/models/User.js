const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  isClient: {
    type: Boolean,
    default: false,
  },
  isFreelancer: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: 'Campus / Remote',
  },
  profileImage: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  // Embedded Profile Data
  clientProfile: {
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    description: { type: String, default: '' },
    totalSpent: { type: Number, default: 0 },
  },
  freelancerProfile: {
    title: { type: String, default: 'University Student & Freelancer' },
    overview: { type: String, default: '' },
    hourlyRate: { type: Number, default: 25 },
    skills: [{ type: String }],
    portfolioUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    connects: { type: Number, default: 20 },
    completedJobsCount: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
}, { timestamps: true });

userSchema.virtual('displayName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.email.split('@')[0];
});

userSchema.virtual('roleLabel').get(function() {
  if (this.isAdmin) return 'Admin';
  if (this.isClient && this.isFreelancer) return 'Client & Freelancer';
  if (this.isClient) return 'Client';
  if (this.isFreelancer) return 'Freelancer';
  return 'Member';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
