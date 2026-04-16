// src/routes/auth.js
const express = require('express');
const router  = express.Router();
const {
  registerHost,
  loginHost,
  registerAttendee,
  loginAttendee,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/host/register',     registerHost);
router.post('/host/login',        loginHost);
router.post('/attendee/register', registerAttendee);
router.post('/attendee/login',    loginAttendee);
router.get('/me',                 protect, getMe);

module.exports = router;
