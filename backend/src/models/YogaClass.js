const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration_minutes: { type: Number, default: 30 },
    image_url: { type: String, default: null },
    instructor: { type: String, default: 'Yoga Flow Team' },
    max_participants: { type: Number, default: 20 },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('YogaClass', classSchema);
