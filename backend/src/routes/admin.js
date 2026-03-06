const express = require('express');

const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const BlogPost = require('../models/BlogPost');
const InstructorVideo = require('../models/InstructorVideo');
const LiveSession = require('../models/LiveSession');
const LearnerProgress = require('../models/LearnerProgress');
const Complaint = require('../models/Complaint');
const YogaCategory = require('../models/YogaCategory');
const PlatformSetting = require('../models/PlatformSetting');
const { toClient } = require('../utils/serialize');

const router = express.Router();

router.use(auth, requireAdmin);

const sanitizeUser = (doc) => {
  const user = toClient(doc);
  if (!user) return null;
  delete user.password_hash;
  return user;
};

router.get('/dashboard-analytics', async (_req, res) => {
  try {
    const [instructors, learners, videos, blogs, liveSessions, complaints] = await Promise.all([
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'practitioner' }),
      InstructorVideo.countDocuments({ status: 'active' }),
      BlogPost.countDocuments({ published: true }),
      LiveSession.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
    ]);

    const popularClasses = await LearnerProgress.aggregate([
      { $group: { _id: '$class_title', views: { $sum: 1 }, totalMinutes: { $sum: '$minutes' } } },
      { $sort: { views: -1, totalMinutes: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, class_title: '$_id', views: 1, total_minutes: '$totalMinutes' } },
    ]);

    return res.json({
      totals: {
        instructors,
        learners,
        videos,
        blogs,
        live_sessions: liveSessions,
        open_complaints: complaints,
      },
      popular_classes: popularClasses,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to load analytics.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { role, accountStatus, instructorStatus, q } = req.query;
    const query = {};

    if (role) query.role = String(role);
    if (accountStatus) query.account_status = String(accountStatus);
    if (instructorStatus) query.instructor_status = String(instructorStatus);
    if (q) {
      const pattern = new RegExp(String(q).trim(), 'i');
      query.$or = [{ full_name: pattern }, { email: pattern }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch users.' });
  }
});

router.patch('/users/:id', async (req, res) => {
  try {
    const { role, accountStatus, instructorStatus, isVerified } = req.body;
    const updates = {};

    if (role !== undefined) {
      if (!['admin', 'instructor', 'practitioner'].includes(String(role))) {
        return res.status(400).json({ message: 'Invalid role.' });
      }
      updates.role = role;
    }

    if (accountStatus !== undefined) {
      if (!['active', 'inactive', 'blocked'].includes(String(accountStatus))) {
        return res.status(400).json({ message: 'Invalid accountStatus.' });
      }
      updates.account_status = accountStatus;
    }

    if (instructorStatus !== undefined) {
      if (!['pending', 'approved', 'rejected', 'suspended'].includes(String(instructorStatus))) {
        return res.status(400).json({ message: 'Invalid instructorStatus.' });
      }
      updates.instructor_status = instructorStatus;
    }

    if (isVerified !== undefined) {
      updates.is_verified = Boolean(isVerified);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(sanitizeUser(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update user.' });
  }
});

router.get('/instructors/pending', async (_req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor', instructor_status: 'pending' }).sort({ createdAt: -1 });
    return res.json(instructors.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch pending instructors.' });
  }
});

router.patch('/instructors/:id/approve', async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'instructor' },
      { instructor_status: 'approved', is_verified: true, account_status: 'active' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Instructor not found.' });
    }
    return res.json(sanitizeUser(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to approve instructor.' });
  }
});

router.patch('/instructors/:id/suspend', async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'instructor' },
      { instructor_status: 'suspended', account_status: 'blocked' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Instructor not found.' });
    }
    return res.json(sanitizeUser(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to suspend instructor.' });
  }
});

router.get('/videos', async (_req, res) => {
  try {
    const videos = await InstructorVideo.find().sort({ createdAt: -1 });
    return res.json(videos.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch videos.' });
  }
});

router.patch('/videos/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.status !== undefined) {
      if (!['active', 'removed'].includes(String(req.body.status))) {
        return res.status(400).json({ message: 'Invalid video status.' });
      }
      updates.status = String(req.body.status);
    }
    if (req.body.category !== undefined) updates.category = String(req.body.category).trim();
    if (req.body.tags !== undefined) updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    const updated = await InstructorVideo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Video not found.' });
    }
    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update video.' });
  }
});

router.delete('/videos/:id', async (req, res) => {
  try {
    const deleted = await InstructorVideo.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Video not found.' });
    }
    return res.json({ message: 'Video removed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete video.' });
  }
});

router.get('/live-sessions', async (_req, res) => {
  try {
    const sessions = await LiveSession.find().sort({ updatedAt: -1 });
    return res.json(sessions.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch live sessions.' });
  }
});

router.patch('/live-sessions/:id', async (req, res) => {
  try {
    const updates = {};

    if (req.body.status !== undefined) {
      if (!['scheduled', 'live', 'cancelled', 'completed'].includes(String(req.body.status))) {
        return res.status(400).json({ message: 'Invalid live session status.' });
      }
      updates.status = String(req.body.status);
      updates.is_live = updates.status === 'live';
    }

    if (req.body.topic !== undefined) updates.topic = String(req.body.topic).trim();
    if (req.body.scheduledFor !== undefined) updates.scheduled_for = req.body.scheduledFor ? new Date(req.body.scheduledFor) : null;

    const updated = await LiveSession.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Live session not found.' });
    }
    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update live session.' });
  }
});

router.get('/blogs', async (_req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    return res.json(blogs.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch blogs.' });
  }
});

router.patch('/blogs/:id', async (req, res) => {
  try {
    const updates = {};

    if (req.body.approvalStatus !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(String(req.body.approvalStatus))) {
        return res.status(400).json({ message: 'Invalid approvalStatus.' });
      }
      updates.approval_status = String(req.body.approvalStatus);
      if (updates.approval_status === 'approved') {
        updates.published = true;
      }
      if (updates.approval_status === 'rejected') {
        updates.published = false;
      }
    }

    if (req.body.published !== undefined) updates.published = Boolean(req.body.published);
    if (req.body.spamFlag !== undefined) updates.spam_flag = Boolean(req.body.spamFlag);
    if (req.body.title !== undefined) updates.title = String(req.body.title).trim();
    if (req.body.content !== undefined) updates.content = String(req.body.content);
    if (req.body.excerpt !== undefined) updates.excerpt = req.body.excerpt ? String(req.body.excerpt) : null;

    const updated = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update blog.' });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    const deleted = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Blog not found.' });
    }
    return res.json({ message: 'Blog removed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete blog.' });
  }
});

router.get('/learners/activity', async (req, res) => {
  try {
    const inactiveDays = Number(req.query.inactiveDays || 14);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - inactiveDays);

    const learners = await User.find({ role: 'practitioner' }).sort({ createdAt: -1 });
    const activities = await LearnerProgress.aggregate([
      { $match: { session_date: { $gte: cutoff } } },
      {
        $group: {
          _id: '$user_id',
          total_sessions: { $sum: 1 },
          total_minutes: { $sum: '$minutes' },
          last_session: { $max: '$session_date' },
        },
      },
    ]);

    const activityByUser = new Map(activities.map((item) => [item._id, item]));
    const result = learners.map((learner) => {
      const a = activityByUser.get(learner._id.toString());
      return {
        id: learner._id.toString(),
        name: learner.full_name,
        email: learner.email,
        account_status: learner.account_status,
        total_sessions: a?.total_sessions || 0,
        total_minutes: a?.total_minutes || 0,
        last_session: a?.last_session || null,
        inactive: !a,
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch learner activity.' });
  }
});

router.get('/complaints', async (req, res) => {
  try {
    const status = req.query.status ? { status: String(req.query.status) } : {};
    const complaints = await Complaint.find(status).sort({ createdAt: -1 });
    return res.json(complaints.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch complaints.' });
  }
});

router.patch('/complaints/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.status !== undefined) {
      if (!['open', 'resolved', 'dismissed'].includes(String(req.body.status))) {
        return res.status(400).json({ message: 'Invalid complaint status.' });
      }
      updates.status = String(req.body.status);
    }
    if (req.body.actionTaken !== undefined) updates.action_taken = String(req.body.actionTaken).trim();

    const updated = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update complaint.' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await YogaCategory.find().sort({ createdAt: -1 });
    return res.json(categories.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch categories.' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'name is required.' });
    }
    const created = await YogaCategory.create({
      name: String(name).trim(),
      description: description ? String(description) : '',
      tags: Array.isArray(tags) ? tags : [],
    });
    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create category.' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updates.description = String(req.body.description);
    if (req.body.tags !== undefined) updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    if (req.body.isActive !== undefined) updates.is_active = Boolean(req.body.isActive);

    const updated = await YogaCategory.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update category.' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await YogaCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    return res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete category.' });
  }
});

router.get('/settings', async (_req, res) => {
  try {
    const settings = await PlatformSetting.find().sort({ key: 1 });
    return res.json(settings.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch settings.' });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const updated = await PlatformSetting.findOneAndUpdate(
      { key: req.params.key },
      {
        key: req.params.key,
        value: req.body.value,
        description: req.body.description ? String(req.body.description) : '',
      },
      { new: true, upsert: true }
    );
    return res.json(toClient(updated));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update setting.' });
  }
});

module.exports = router;
