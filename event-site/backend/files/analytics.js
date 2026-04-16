// src/routes/analytics.js
const express = require('express');
const router  = express.Router();
const {
  getHostOverview,
  getEventAnalytics,
} = require('../controllers/analyticsController');
const { protect, hostOnly } = require('../middleware/auth');

router.get('/host/overview',       protect, hostOnly, getHostOverview);
router.get('/event/:eventId',      protect, hostOnly, getEventAnalytics);

module.exports = router;
