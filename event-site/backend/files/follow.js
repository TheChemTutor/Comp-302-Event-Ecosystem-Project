// src/routes/follow.js
const express = require('express');
const router  = express.Router();
const {
  followHost,
  unfollowHost,
  getMyNotifications,
} = require('../controllers/followController');
const { protect, attendeeOnly } = require('../middleware/auth');

router.post('/follow/:hostId',       protect, attendeeOnly, followHost);
router.delete('/follow/:hostId',     protect, attendeeOnly, unfollowHost);
router.get('/notifications/my',      protect, attendeeOnly, getMyNotifications);

module.exports = router;
