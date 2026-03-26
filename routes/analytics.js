const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const FeatureClick = require('../models/FeatureClick');

// POST /api/analytics/track - Record a user interaction
router.post(
  '/track',
  authMiddleware,
  [
    body('feature_name')
      .trim()
      .notEmpty()
      .withMessage('Feature name is required'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { feature_name } = req.body;
      const userId = req.user.id;

      // Create feature click record
      const click = await FeatureClick.create(userId, feature_name);

      res.status(201).json({
        success: true,
        message: 'Interaction tracked successfully',
        data: click,
      });
    } catch (error) {
      console.error('Track error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error while tracking interaction' 
      });
    }
  }
);

// GET /api/analytics/data - Retrieve aggregated data for charts
router.get('/data', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, age, gender, feature } = req.query;

    const filters = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      // Set end date to end of day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end;
    }

    if (age) {
      filters.age = age;
    }

    if (gender) {
      filters.gender = gender;
    }

    // Get aggregated feature clicks (for bar chart)
    const featureClicks = await FeatureClick.getAggregated(filters);

    // Get time trend data if feature is specified (for line chart)
    let timeTrend = [];
    if (feature) {
      timeTrend = await FeatureClick.getTimeTrend(feature, filters);
    }

    res.json({
      success: true,
      data: {
        featureClicks,
        timeTrend,
      },
    });
  } catch (error) {
    console.error('Analytics data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching analytics data' 
    });
  }
});

module.exports = router;
