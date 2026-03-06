const mongoose = require('mongoose');

const learnerProgressSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    class_title: { type: String, required: true, trim: true },
    minutes: { type: Number, required: true, min: 1 },
    completed: { type: Boolean, default: true },
    session_date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearnerProgress', learnerProgressSchema);
