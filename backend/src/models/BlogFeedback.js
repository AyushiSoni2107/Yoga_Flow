const mongoose = require('mongoose');

const blogFeedbackSchema = new mongoose.Schema(
  {
    blog_slug: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogFeedback', blogFeedbackSchema);
