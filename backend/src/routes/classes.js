const express = require('express');

const auth = require('../middleware/auth');
const requireInstructor = require('../middleware/requireInstructor');
const YogaClass = require('../models/YogaClass');
const { defaultClasses } = require('../utils/defaultData');
const { toClient } = require('../utils/serialize');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const count = await YogaClass.countDocuments();
    if (count === 0) {
      await YogaClass.insertMany(defaultClasses);
    }

    const classes = await YogaClass.find().sort({ createdAt: -1 });
    return res.json(classes.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch classes.' });
  }
});

router.post('/', auth, requireInstructor, async (req, res) => {
  try {
    const created = await YogaClass.create(req.body);
    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
