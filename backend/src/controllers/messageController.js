const { Message, Contract } = require('../models');

// @desc Get messages for a contract
// @route GET /api/contracts/:id/messages
const getMessages = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isClient = contract.client._id.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer._id.toString() === req.user._id.toString();

    if (!isClient && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ contract: req.params.id })
      .populate('sender', 'firstName lastName email profileImage isClient isFreelancer')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Send a message in contract workroom
// @route POST /api/contracts/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const message = await Message.create({
      contract: req.params.id,
      sender: req.user._id,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id);

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
