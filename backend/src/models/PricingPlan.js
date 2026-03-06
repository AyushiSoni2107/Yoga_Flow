const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    interval: { type: String, enum: ['month', 'year'], default: 'month' },
    features: { type: [String], default: [] },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);
