const mongoose = require('mongoose');

const instructorVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    file_name: { type: String, required: true, trim: true },
    video_url: { type: String, required: true, trim: true },
    mime_type: { type: String, default: 'video/mp4' },
    views: { type: Number, default: 0 },
    uploaded_by: { type: String, required: true },
    uploaded_by_name: { type: String, default: 'Yoga Flow Instructor' },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InstructorVideo', instructorVideoSchema);
