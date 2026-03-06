const express = require('express');

const auth = require('../middleware/auth');
const requireInstructor = require('../middleware/requireInstructor');
const BlogPost = require('../models/BlogPost');
const BlogFeedback = require('../models/BlogFeedback');
const User = require('../models/User');
const { defaultBlogs } = require('../utils/defaultData');
const { toClient } = require('../utils/serialize');

const router = express.Router();

const enrichAuthorNames = async (posts) => {
  const authorIds = Array.from(
    new Set(posts.map((post) => post.author_id).filter(Boolean))
  );

  if (authorIds.length === 0) {
    return posts.map((post) => ({ ...post, author_name: post.author_name || 'Instructor' }));
  }

  const users = await User.find({ _id: { $in: authorIds } }, { _id: 1, full_name: 1 });
  const userMap = new Map(users.map((user) => [String(user._id), user.full_name]));

  return posts.map((post) => ({
    ...post,
    author_name: post.author_name || userMap.get(String(post.author_id)) || 'Instructor',
  }));
};

router.get('/', async (_req, res) => {
  try {
    const count = await BlogPost.countDocuments();
    if (count === 0) {
      await BlogPost.insertMany(defaultBlogs);
    }

    const posts = await BlogPost.find({ published: true, spam_flag: false }).sort({ createdAt: -1 });
    const serialized = posts.map(toClient);
    return res.json(await enrichAuthorNames(serialized));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch blogs.' });
  }
});

router.post('/', auth, requireInstructor, async (req, res) => {
  try {
    const { title, content, excerpt, image_url, published } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required.' });
    }

    const slug = String(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    const created = await BlogPost.create({
      title,
      slug: `${slug}-${Date.now()}`,
      content,
      excerpt: excerpt || content.slice(0, 120),
      image_url: image_url || null,
      author_id: req.user._id.toString(),
      author_name: req.user.full_name,
      published: Boolean(published),
      approval_status: Boolean(published) ? 'approved' : 'pending',
      spam_flag: false,
    });

    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to publish blog.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await BlogPost.findOne({ slug: req.params.slug, published: true, spam_flag: false });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }
    const serialized = toClient(blog);
    const [enriched] = await enrichAuthorNames([serialized]);
    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch blog.' });
  }
});

router.get('/:slug/feedback', async (req, res) => {
  try {
    const feedback = await BlogFeedback.find({ blog_slug: req.params.slug }).sort({ createdAt: -1 });
    return res.json(feedback.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch feedback.' });
  }
});

router.post('/:slug/feedback', async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'name and message are required.' });
    }

    const blog = await BlogPost.findOne({ slug: req.params.slug, published: true, spam_flag: false });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    const created = await BlogFeedback.create({
      blog_slug: req.params.slug,
      name: String(name).trim(),
      message: String(message).trim(),
      rating: Number(rating || 5),
    });

    return res.status(201).json(toClient(created));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to submit feedback.' });
  }
});

module.exports = router;
