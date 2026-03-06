const express = require('express');

const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const { toClient } = require('../utils/serialize');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'targetType, targetId and reason are required.' });
    }

    if (!['instructor', 'blog', 'video', 'session', 'user'].includes(String(targetType))) {
      return res.status(400).json({ message: 'Invalid targetType.' });
    }

    const created = await Complaint.create({
      reporter_id: req.user._id.toString(),
      target_type: String(targetType),
      target_id: String(targetId),
      reason: String(reason).trim(),
      details: details ? String(details).trim() : '',
    });

    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit complaint.' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ reporter_id: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(complaints.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load your complaints.' });
  }
});

module.exports = router;
