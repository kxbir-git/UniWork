const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '../../data/db.json');

// Ensure data folder exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate simple 24-char hex IDs matching MongoDB ObjectId format
const generateId = () => {
  return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Initial state
let db = {
  users: [],
  jobs: [],
  proposals: [],
  contracts: [],
  wallets: [],
  transactions: [],
  messages: [],
};

// Save to disk
const saveDB = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db to disk:', err);
  }
};

// Load from disk
const loadDB = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log('📂 Loaded database from disk.');
    }
  } catch (err) {
    console.error('Error loading db from disk:', err);
  }
};

loadDB();

// Helper to decorate user object with virtuals & methods
const formatUser = (user) => {
  if (!user) return null;
  const clone = { ...user };
  clone.displayName = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0];
  clone.roleLabel = user.isAdmin ? 'Admin' : (user.isClient ? 'Client' : 'Freelancer');
  clone.matchPassword = async function(pass) {
    return await bcrypt.compare(pass, this.password);
  };
  return clone;
};

// Helper to decorate job
const formatJob = (job) => {
  if (!job) return null;
  const clone = { ...job };
  if (job.budgetType === 'hourly') {
    clone.budgetDisplay = (job.budgetMax && job.budgetMax !== job.budgetMin) ? `$${job.budgetMin} - $${job.budgetMax}/hr` : `$${job.budgetMin}/hr`;
  } else {
    clone.budgetDisplay = (job.budgetMax && job.budgetMax !== job.budgetMin) ? `$${job.budgetMin} - $${job.budgetMax}` : `$${job.budgetMin}`;
  }
  return clone;
};

// Helper to decorate contract
const formatContract = (contract) => {
  if (!contract) return null;
  const clone = { ...contract };
  if (contract.milestones && contract.milestones.length > 0) {
    const approved = contract.milestones.filter(m => m.isApproved).length;
    clone.progressPercentage = Math.round((approved / contract.milestones.length) * 100);
  } else {
    clone.progressPercentage = 0;
  }
  return clone;
};

module.exports = {
  db,
  saveDB,
  generateId,
  formatUser,
  formatJob,
  formatContract,
};
