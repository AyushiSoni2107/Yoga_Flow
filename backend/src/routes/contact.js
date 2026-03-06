const express = require('express');

const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'name, email and message are required.' });
    }

    const created = await ContactMessage.create({ name, email, message });
    return res.status(201).json({ id: String(created._id), message: 'Message saved successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit contact form.' });
  }
});

module.exports = router;
