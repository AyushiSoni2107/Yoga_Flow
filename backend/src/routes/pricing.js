const express = require('express');

const PricingPlan = require('../models/PricingPlan');
const { defaultPricing } = require('../utils/defaultData');
const { toClient } = require('../utils/serialize');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const count = await PricingPlan.countDocuments();
    if (count === 0) {
      await PricingPlan.insertMany(defaultPricing);
    }

    const plans = await PricingPlan.find({ is_active: true }).sort({ display_order: 1 });
    return res.json(plans.map(toClient));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch pricing plans.' });
  }
});

module.exports = router;
