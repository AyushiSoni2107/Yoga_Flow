const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    reporter_id: { type: String, required: true, index: true },
    target_type: { type: String, enum: ['instructor', 'blog', 'video', 'session', 'user'], required: true },
    target_id: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    details: { type: String, default: '' },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
    action_taken: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
