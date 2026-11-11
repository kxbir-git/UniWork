const bcrypt = require('bcryptjs');
const { db, saveDB, generateId, formatUser, formatJob, formatContract } = require('./index');

const UserModel = {
  async findOne(query) {
    let user = null;
    if (query.email) {
      user = db.users.find(u => u.email.toLowerCase() === query.email.toLowerCase());
    } else if (query._id) {
      user = db.users.find(u => u._id.toString() === query._id.toString());
    }
    return formatUser(user);
  },

  async findById(id) {
    const user = db.users.find(u => u._id.toString() === id.toString());
    return formatUser(user);
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newUser = {
      _id: generateId(),
      ...data,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDB();
    return formatUser(newUser);
  },

  async findByIdAndUpdate(id, updates, options = {}) {
    const index = db.users.findIndex(u => u._id.toString() === id.toString());
    if (index === -1) return null;

    if (updates.$inc) {
      for (const key in updates.$inc) {
        const parts = key.split('.');
        if (parts.length === 2) {
          db.users[index][parts[0]][parts[1]] = (db.users[index][parts[0]][parts[1]] || 0) + updates.$inc[key];
        } else {
          db.users[index][key] = (db.users[index][key] || 0) + updates.$inc[key];
        }
      }
    }

    const { $inc, ...directUpdates } = updates;
    Object.assign(db.users[index], directUpdates);
    db.users[index].updatedAt = new Date().toISOString();
    saveDB();
    return formatUser(db.users[index]);
  },

  async countDocuments(query = {}) {
    if (query.isFreelancer) return db.users.filter(u => u.isFreelancer).length;
    if (query.isClient) return db.users.filter(u => u.isClient).length;
    return db.users.length;
  },
};

const JobModel = {
  find(query = {}) {
    let result = [...db.jobs];

    if (query.status) {
      if (typeof query.status === 'object' && query.status.$in) {
        result = result.filter(j => query.status.$in.includes(j.status));
      } else {
        result = result.filter(j => j.status === query.status);
      }
    }

    if (query.client) {
      result = result.filter(j => j.client.toString() === query.client.toString());
    }

    if (query.budgetType) {
      result = result.filter(j => j.budgetType === query.budgetType);
    }

    if (query.experienceLevel) {
      result = result.filter(j => j.experienceLevel === query.experienceLevel);
    }

    if (query.category) {
      const reg = new RegExp(query.category.$regex, query.category.$options);
      result = result.filter(j => reg.test(j.category));
    }

    if (query.$or) {
      result = result.filter(j => {
        return query.$or.some(cond => {
          if (cond.title) return new RegExp(cond.title.$regex, cond.title.$options).test(j.title);
          if (cond.description) return new RegExp(cond.description.$regex, cond.description.$options).test(j.description);
          if (cond.skillsRequired) {
            const re = cond.skillsRequired.$in[0];
            return j.skillsRequired.some(s => re.test(s));
          }
          return false;
        });
      });
    }

    // Sort helper
    const sort = (criteria) => {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return {
        populate: (field, fieldsToSelect) => {
          return result.map(j => {
            const client = db.users.find(u => u._id.toString() === j.client.toString());
            return {
              ...formatJob(j),
              client: formatUser(client),
            };
          });
        },
      };
    };

    return {
      populate: (field, fieldsToSelect) => {
        return {
          sort: (criteria) => {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return result.map(j => {
              const client = db.users.find(u => u._id.toString() === j.client.toString());
              return {
                ...formatJob(j),
                client: formatUser(client),
              };
            });
          },
        };
      },
      sort,
    };
  },

  async findById(id) {
    const job = db.jobs.find(j => j._id.toString() === id.toString());
    if (!job) return null;
    const client = db.users.find(u => u._id.toString() === job.client.toString());
    const formatted = formatJob(job);
    formatted.client = formatUser(client);
    formatted.save = async function() {
      const idx = db.jobs.findIndex(j => j._id.toString() === this._id.toString());
      if (idx !== -1) {
        db.jobs[idx] = { ...this };
        saveDB();
      }
      return this;
    };
    return {
      ...formatted,
      populate: async (f, s) => formatted,
    };
  },

  async create(data) {
    const newJob = {
      _id: generateId(),
      ...data,
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.jobs.push(newJob);
    saveDB();
    return formatJob(newJob);
  },

  async findByIdAndUpdate(id, updates, options = {}) {
    const index = db.jobs.findIndex(j => j._id.toString() === id.toString());
    if (index === -1) return null;
    Object.assign(db.jobs[index], updates);
    db.jobs[index].updatedAt = new Date().toISOString();
    saveDB();
    return formatJob(db.jobs[index]);
  },

  async countDocuments(query = {}) {
    return db.jobs.length;
  },
};

const ProposalModel = {
  find(query = {}) {
    let result = [...db.proposals];
    if (query.job) {
      if (typeof query.job === 'object' && query.job.$in) {
        const idList = query.job.$in.map(i => i.toString());
        result = result.filter(p => idList.includes(p.job.toString()));
      } else {
        result = result.filter(p => p.job.toString() === query.job.toString());
      }
    }
    if (query.freelancer) {
      result = result.filter(p => p.freelancer.toString() === query.freelancer.toString());
    }

    const sort = () => {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return result.map(p => {
        const freelancer = db.users.find(u => u._id.toString() === p.freelancer.toString());
        const job = db.jobs.find(j => j._id.toString() === p.job.toString());
        return {
          ...p,
          freelancer: formatUser(freelancer),
          job: formatJob(job),
        };
      });
    };

    return {
      populate: (field, select) => {
        return {
          sort,
        };
      },
      sort,
    };
  },

  async findById(id) {
    const p = db.proposals.find(item => item._id.toString() === id.toString());
    if (!p) return null;
    const job = db.jobs.find(j => j._id.toString() === p.job.toString());
    const freelancer = db.users.find(u => u._id.toString() === p.freelancer.toString());
    return {
      ...p,
      job: formatJob(job),
      freelancer: formatUser(freelancer),
      save: async function() {
        const idx = db.proposals.findIndex(item => item._id.toString() === this._id.toString());
        if (idx !== -1) {
          db.proposals[idx].status = this.status;
          saveDB();
        }
        return this;
      },
      populate: async () => ({
        ...p,
        job: formatJob(job),
        freelancer: formatUser(freelancer),
      }),
    };
  },

  async findOne(query) {
    const p = db.proposals.find(item => {
      let matches = true;
      if (query.job && item.job.toString() !== query.job.toString()) matches = false;
      if (query.freelancer && item.freelancer.toString() !== query.freelancer.toString()) matches = false;
      return matches;
    });
    return p ? { ...p } : null;
  },

  async create(data) {
    const newProp = {
      _id: generateId(),
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.proposals.push(newProp);
    saveDB();
    return newProp;
  },

  async countDocuments(query = {}) {
    let result = db.proposals;
    if (query.job && query.job.$in) {
      const idList = query.job.$in.map(i => i.toString());
      result = result.filter(p => idList.includes(p.job.toString()));
    }
    if (query.status) {
      result = result.filter(p => p.status === query.status);
    }
    return result.length;
  },
};

const ContractModel = {
  find(query = {}) {
    let result = [...db.contracts];
    if (query.$or) {
      const clientCond = query.$or.find(c => c.client);
      const freelancerCond = query.$or.find(c => c.freelancer);
      result = result.filter(c => {
        return (clientCond && c.client.toString() === clientCond.client.toString()) ||
               (freelancerCond && c.freelancer.toString() === freelancerCond.freelancer.toString());
      });
    }
    if (query.client) result = result.filter(c => c.client.toString() === query.client.toString());
    if (query.freelancer) result = result.filter(c => c.freelancer.toString() === query.freelancer.toString());
    if (query.status) result = result.filter(c => c.status === query.status);

    const sort = () => {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return result.map(c => {
        const job = db.jobs.find(j => j._id.toString() === c.job.toString());
        const client = db.users.find(u => u._id.toString() === c.client.toString());
        const freelancer = db.users.find(u => u._id.toString() === c.freelancer.toString());
        return {
          ...formatContract(c),
          job: formatJob(job),
          client: formatUser(client),
          freelancer: formatUser(freelancer),
        };
      });
    };

    return {
      populate: () => ({
        populate: () => ({
          populate: () => ({
            sort,
          }),
          sort,
        }),
        sort,
      }),
      sort,
    };
  },

  async findById(id) {
    const c = db.contracts.find(item => item._id.toString() === id.toString());
    if (!c) return null;
    const job = db.jobs.find(j => j._id.toString() === c.job.toString());
    const client = db.users.find(u => u._id.toString() === c.client.toString());
    const freelancer = db.users.find(u => u._id.toString() === c.freelancer.toString());

    const formatted = formatContract(c);
    formatted.job = formatJob(job);
    formatted.client = formatUser(client);
    formatted.freelancer = formatUser(freelancer);

    // Provide milestone subdocument id helper
    formatted.milestones = formatted.milestones.map(m => ({
      ...m,
      submissions: m.submissions || [],
    }));

    formatted.milestones.id = function(mId) {
      return this.find(m => m._id.toString() === mId.toString());
    };

    formatted.save = async function() {
      const idx = db.contracts.findIndex(item => item._id.toString() === this._id.toString());
      if (idx !== -1) {
        db.contracts[idx] = {
          ...this,
          job: this.job._id || this.job,
          client: this.client._id || this.client,
          freelancer: this.freelancer._id || this.freelancer,
        };
        saveDB();
      }
      return this;
    };

    return {
      ...formatted,
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: () => formatted,
          }),
        }),
      }),
    };
  },

  async findOne(query) {
    const c = db.contracts.find(item => {
      if (query.job && item.job.toString() === query.job.toString()) return true;
      return false;
    });
    return c ? formatContract(c) : null;
  },

  async create(data) {
    const milestones = (data.milestones || []).map(m => ({
      _id: generateId(),
      ...m,
      isApproved: m.isApproved || false,
      submissions: [],
    }));

    const newContract = {
      _id: generateId(),
      ...data,
      milestones,
      amountPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.contracts.push(newContract);
    saveDB();
    return formatContract(newContract);
  },

  async countDocuments(query = {}) {
    let result = db.contracts;
    if (query.status) result = result.filter(c => c.status === query.status);
    return result.length;
  },
};

const WalletModel = {
  async findOne(query) {
    const w = db.wallets.find(item => item.user.toString() === query.user.toString());
    if (!w) return null;
    return {
      ...w,
      save: async function() {
        const idx = db.wallets.findIndex(item => item._id.toString() === this._id.toString());
        if (idx !== -1) {
          db.wallets[idx].balance = this.balance;
          db.wallets[idx].escrowHeld = this.escrowHeld;
          saveDB();
        }
        return this;
      },
    };
  },

  async create(data) {
    const newWallet = {
      _id: generateId(),
      user: data.user,
      balance: data.balance || 0,
      escrowHeld: data.escrowHeld || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.wallets.push(newWallet);
    saveDB();
    return {
      ...newWallet,
      save: async function() {
        const idx = db.wallets.findIndex(item => item._id.toString() === this._id.toString());
        if (idx !== -1) {
          db.wallets[idx].balance = this.balance;
          db.wallets[idx].escrowHeld = this.escrowHeld;
          saveDB();
        }
        return this;
      },
    };
  },
};

const TransactionModel = {
  find(query = {}) {
    let result = [...db.transactions];
    if (query.wallet) result = result.filter(t => t.wallet.toString() === query.wallet.toString());

    return {
      sort: (s) => {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return {
          limit: (n) => result.slice(0, n),
        };
      },
    };
  },

  async create(data) {
    const newTx = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.transactions.push(newTx);
    saveDB();
    return newTx;
  },
};

const MessageModel = {
  find(query = {}) {
    let result = [...db.messages];
    if (query.contract) result = result.filter(m => m.contract.toString() === query.contract.toString());

    return {
      populate: () => ({
        sort: () => {
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          return result.map(m => {
            const sender = db.users.find(u => u._id.toString() === m.sender.toString());
            return {
              ...m,
              sender: formatUser(sender),
            };
          });
        },
      }),
    };
  },

  async findById(id) {
    const m = db.messages.find(item => item._id.toString() === id.toString());
    if (!m) return null;
    const sender = db.users.find(u => u._id.toString() === m.sender.toString());
    return {
      ...m,
      populate: () => ({
        ...m,
        sender: formatUser(sender),
      }),
    };
  },

  async create(data) {
    const newMsg = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(newMsg);
    saveDB();
    return newMsg;
  },
};

module.exports = {
  User: UserModel,
  Job: JobModel,
  Proposal: ProposalModel,
  Contract: ContractModel,
  Wallet: WalletModel,
  Transaction: TransactionModel,
  Message: MessageModel,
};
