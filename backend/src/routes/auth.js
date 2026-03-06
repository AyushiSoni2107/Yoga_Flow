const express = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const auth = require('../middleware/auth');
const signToken = require('../utils/token');
const { toClient } = require('../utils/serialize');

const router = express.Router();

const sanitizeUser = (userDoc) => {
  const user = toClient(userDoc);
  if (!user) return null;
  delete user.password_hash;
  return user;
};

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, avatarUrl } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    if (role && !['admin', 'instructor', 'practitioner'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin, instructor or practitioner.' });
    }

    if (avatarUrl && typeof avatarUrl !== 'string') {
      return res.status(400).json({ message: 'avatarUrl must be a string.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name: fullName,
      email: email.toLowerCase(),
      password_hash,
      role: role || 'practitioner',
      avatar_url: avatarUrl || null,
      account_status: 'active',
      instructor_status: 'approved',
      is_verified: true,
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to register user.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (user.account_status === 'blocked') {
      return res.status(403).json({ message: 'Your account is blocked. Contact support.' });
    }
    if (user.account_status === 'inactive') {
      return res.status(403).json({ message: 'Your account is inactive.' });
    }

    const token = signToken(user._id.toString());

    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to login.' });
  }
});

router.get('/me', auth, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const updates = {};

    if (fullName !== undefined) {
      if (!String(fullName).trim()) {
        return res.status(400).json({ message: 'fullName cannot be empty.' });
      }
      updates.full_name = String(fullName).trim();
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl !== null && typeof avatarUrl !== 'string') {
        return res.status(400).json({ message: 'avatarUrl must be a string or null.' });
      }
      updates.avatar_url = avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
});

module.exports = router;
