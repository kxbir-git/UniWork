const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'Software Development',
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed',
  },
  budgetMin: {
    type: Number,
    required: true,
  },
  budgetMax: {
    type: Number,
    default: null,
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'entry',
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open',
  },
  skillsRequired: [{
    type: String,
  }],
  proposalsCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

jobSchema.virtual('budgetDisplay').get(function() {
  if (this.budgetType === 'hourly') {
    if (this.budgetMax && this.budgetMax !== this.budgetMin) {
      return `$${this.budgetMin} - $${this.budgetMax}/hr`;
    }
    return `$${this.budgetMin}/hr`;
  } else {
    if (this.budgetMax && this.budgetMax !== this.budgetMin) {
      return `$${this.budgetMin} - $${this.budgetMax}`;
    }
    return `$${this.budgetMin}`;
  }
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);
