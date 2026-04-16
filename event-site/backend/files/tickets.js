// src/routes/tickets.js
const express = require('express');
const router  = express.Router();
const {
  registerForEvent,
  getMyTickets,
  getTicketQR,
  getEventAttendeeList,
  checkInAttendee,
} = require('../controllers/ticketController');
const { protect, hostOnly, attendeeOnly } = require('../middleware/auth');

// Attendee
router.post('/register/:eventId',   protect, attendeeOnly, registerForEvent);
router.get('/my',                   protect, attendeeOnly, getMyTickets);
router.get('/:ticketId/qr',         protect, attendeeOnly, getTicketQR);

// Host
router.get('/:eventId/list',        protect, hostOnly, getEventAttendeeList);
router.post('/checkin',             protect, hostOnly, checkInAttendee);

module.exports = router;
