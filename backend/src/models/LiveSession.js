const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, trim: true },
    is_live: { type: Boolean, default: false },
    started_by: { type: String, required: true },
    scheduled_for: { type: Date, default: null },
    status: { type: String, enum: ['scheduled', 'live', 'cancelled', 'completed'], default: 'scheduled' },
    attendee_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
