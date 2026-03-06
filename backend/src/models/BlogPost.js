const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: null },
    image_url: { type: String, default: null },
    author_id: { type: String, default: null },
    author_name: { type: String, default: null },
    published: { type: Boolean, default: false },
    approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    spam_flag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', blogPostSchema);
