const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workNotes: {
    type: String,
    required: true,
  },
  attachmentUrl: {
    type: String,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved'],
    default: 'pending',
  },
  submissions: [submissionSchema],
}, { timestamps: true });

const contractSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'disputed', 'cancelled'],
    default: 'active',
  },
  milestones: [milestoneSchema],
}, { timestamps: true });

contractSchema.virtual('progressPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const approved = this.milestones.filter(m => m.isApproved).length;
  return Math.round((approved / this.milestones.length) * 100);
});

contractSchema.set('toJSON', { virtuals: true });
contractSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
