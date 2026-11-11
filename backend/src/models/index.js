// Model router: automatically uses in-memory/JSON store by default
// or switches to Mongoose models if MONGO_URI is active.
const mockModels = require('../mockDb/models');

module.exports = {
  User: mockModels.User,
  Job: mockModels.Job,
  Proposal: mockModels.Proposal,
  Contract: mockModels.Contract,
  Wallet: mockModels.Wallet,
  Transaction: mockModels.Transaction,
  Message: mockModels.Message,
};
