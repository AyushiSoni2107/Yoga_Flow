const express = require('express');

const auth = require('../middleware/auth');
const requirePractitioner = require('../middleware/requirePractitioner');
const YogaClass = require('../models/YogaClass');
const LiveSession = require('../models/LiveSession');
const LearnerProgress = require('../models/LearnerProgress');
const { toClient } = require('../utils/serialize');

const router = express.Router();

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const keyFromLocalDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

router.get('/dashboard', auth, requirePractitioner, async (req, res) => {
  try {
    const classes = await YogaClass.find().sort({ createdAt: -1 }).limit(12);
    const liveSessions = await LiveSession.find({ is_live: true }).sort({ updatedAt: -1 }).limit(6);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const logs = await LearnerProgress.find({
      user_id: req.user._id.toString(),
      session_date: { $gte: weekStart },
    }).sort({ session_date: -1, createdAt: -1 });

    const allLogs = await LearnerProgress.find({ user_id: req.user._id.toString() }).sort({ session_date: -1 }).limit(30);

    const byDay = new Map();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = keyFromLocalDate(d);
      byDay.set(key, { day: dayLabels[d.getDay()], minutes: 0 });
    }

    logs.forEach((entry) => {
      const d = new Date(entry.session_date);
      const key = keyFromLocalDate(d);
      const prev = byDay.get(key);
      if (prev) {
        prev.minutes += entry.minutes;
        byDay.set(key, prev);
      }
    });

    const weeklyProgress = Array.from(byDay.values());
    const totalWeeklyMinutes = weeklyProgress.reduce((sum, item) => sum + item.minutes, 0);
    const practiceDays = weeklyProgress.filter((item) => item.minutes > 0).length;
    const completedSessions = allLogs.filter((item) => item.completed).length;

    return res.json({
      enrolled_classes: classes.map(toClient),
      live_sessions: liveSessions.map((item) => ({
        id: String(item._id),
        topic: item.topic,
        is_live: item.is_live,
        updated_at: item.updatedAt,
      })),
      weekly_progress: weeklyProgress,
      total_weekly_minutes: totalWeeklyMinutes,
      practice_days: practiceDays,
      completed_sessions: completedSessions,
      recent_completed: allLogs
        .filter((item) => item.completed)
        .slice(0, 8)
        .map((item) => ({
          id: String(item._id),
          class_title: item.class_title,
          minutes: item.minutes,
          session_date: item.session_date,
        })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load learner dashboard.' });
  }
});

router.post('/progress', auth, requirePractitioner, async (req, res) => {
  try {
    const { classTitle, minutes, completed } = req.body;
    if (!classTitle || !minutes) {
      return res.status(400).json({ message: 'classTitle and minutes are required.' });
    }

    const created = await LearnerProgress.create({
      user_id: req.user._id.toString(),
      class_title: classTitle,
      minutes: Number(minutes),
      completed: completed !== false,
      session_date: new Date(),
    });

    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to log session.' });
  }
});

module.exports = router;
