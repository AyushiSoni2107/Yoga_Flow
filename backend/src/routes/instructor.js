const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const auth = require('../middleware/auth');
const requireInstructor = require('../middleware/requireInstructor');
const InstructorVideo = require('../models/InstructorVideo');
const LiveSession = require('../models/LiveSession');
const User = require('../models/User');
const LearnerProgress = require('../models/LearnerProgress');
const { toClient } = require('../utils/serialize');

const router = express.Router();
const videosDir = path.join(__dirname, '..', '..', 'uploads', 'videos');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      cb(new Error('Only video files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

const buildMediaUrl = (req, relativePath) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}${relativePath}`;
};

router.get('/videos', auth, requireInstructor, async (req, res) => {
  try {
    const q = String(req.query.q || '').toLowerCase();
    const videos = await InstructorVideo.find({ uploaded_by: req.user._id.toString(), status: 'active' }).sort({ createdAt: -1 });
    const filtered = q
      ? videos.filter((v) => v.title.toLowerCase().includes(q))
      : videos;
    return res.json(filtered.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch videos.' });
  }
});

router.post('/videos', auth, requireInstructor, upload.single('video'), async (req, res) => {
  try {
    const { title, level } = req.body;
    if (!title || !req.file) {
      return res.status(400).json({ message: 'title and video file are required.' });
    }

    const created = await InstructorVideo.create({
      title,
      level: level || 'Beginner',
      file_name: req.file.originalname,
      video_url: buildMediaUrl(req, `/uploads/videos/${req.file.filename}`),
      mime_type: req.file.mimetype,
      uploaded_by: req.user._id.toString(),
      uploaded_by_name: req.user.full_name || 'Yoga Flow Instructor',
      status: 'active',
    });

    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to upload video.' });
  }
});

router.get('/learners', auth, requireInstructor, async (_req, res) => {
  try {
    const learners = await User.find({ role: 'practitioner' }).sort({ createdAt: -1 }).limit(50);
    const learnerIds = learners.map((user) => user._id.toString());
    const activity = await LearnerProgress.aggregate([
      { $match: { user_id: { $in: learnerIds } } },
      {
        $group: {
          _id: '$user_id',
          total_sessions: { $sum: 1 },
          completed_sessions: { $sum: { $cond: ['$completed', 1, 0] } },
        },
      },
    ]);
    const activityByLearner = new Map(activity.map((item) => [item._id, item]));

    const result = learners.map((u) => {
      const stats = activityByLearner.get(u._id.toString());
      const totalSessions = stats?.total_sessions || 0;
      const completedSessions = stats?.completed_sessions || 0;
      const attendance = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

      return {
        id: String(u._id),
        name: u.full_name,
        email: u.email,
        plan: 'N/A',
        attendance: `${attendance}%`,
        total_sessions: totalSessions,
        completed_sessions: completedSessions,
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch learners.' });
  }
});

router.get('/live', auth, requireInstructor, async (req, res) => {
  try {
    const live = await LiveSession.findOne({ started_by: req.user._id.toString() }).sort({ createdAt: -1 });
    if (!live) {
      return res.json({ topic: 'Evening Relax Session', is_live: false, status: 'scheduled', scheduled_for: null });
    }
    return res.json({
      topic: live.topic,
      is_live: live.is_live,
      status: live.status,
      scheduled_for: live.scheduled_for,
      updated_at: live.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch live session status.' });
  }
});

router.post('/live', auth, requireInstructor, async (req, res) => {
  try {
    const { topic, isLive, scheduledFor } = req.body;
    const liveState = Boolean(isLive);
    const session = await LiveSession.findOneAndUpdate(
      { started_by: req.user._id.toString() },
      {
        topic: topic || 'Yoga Live Session',
        is_live: liveState,
        status: liveState ? 'live' : 'scheduled',
        scheduled_for: scheduledFor ? new Date(scheduledFor) : null,
        started_by: req.user._id.toString(),
      },
      { new: true, upsert: true }
    );

    return res.json({
      topic: session.topic,
      is_live: session.is_live,
      status: session.status,
      scheduled_for: session.scheduled_for,
      updated_at: session.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update live session.' });
  }
});

module.exports = router;
