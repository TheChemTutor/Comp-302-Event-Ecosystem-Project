// src/controllers/ticketController.js
// ─────────────────────────────────────────────────────────────────────────────
// Attendee registration, QR code delivery, attendee list for host,
// and QR scan check-in for the host mobile scanner.
// ─────────────────────────────────────────────────────────────────────────────

const { db, COLLECTIONS }            = require('../config/firebase');
const { createTicketDocument }       = require('../models/schemas');
const { generateQRCode, isValidQRData } = require('../services/qrService');
const {
  sendRegistrationConfirmation,
  saveNotification,
} = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tickets/register/:eventId
// Attendee only. Register for an event and receive a QR code ticket.
// ─────────────────────────────────────────────────────────────────────────────

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const attendeeId  = req.user.id;

    // 1. Check event exists and is upcoming
    const eventSnap = await db.collection(COLLECTIONS.EVENTS).doc(eventId).get();
    if (!eventSnap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    const event = { id: eventSnap.id, ...eventSnap.data() };

    if (event.status === 'past') {
      return res.status(400).json({ success: false, error: 'Cannot register for a past event.' });
    }

    // 2. Check attendee not already registered
    const existingTicket = await db.collection(COLLECTIONS.TICKETS)
      .where('attendeeId', '==', attendeeId)
      .where('eventId',   '==', eventId)
      .limit(1)
      .get();

    if (!existingTicket.empty) {
      return res.status(409).json({ success: false, error: 'Already registered for this event.' });
    }

    // 3. Check capacity (if set)
    if (event.capacity) {
      const registeredCount = (
        await db.collection(COLLECTIONS.TICKETS)
          .where('eventId', '==', eventId)
          .get()
      ).size;

      if (registeredCount >= event.capacity) {
        return res.status(400).json({ success: false, error: 'Event is at full capacity.' });
      }
    }

    // 4. Generate QR code — we need the ticket doc ID first, so create then update
    const placeholderDoc = await db.collection(COLLECTIONS.TICKETS).add({
      attendeeId, eventId, createdAt: new Date().toISOString(),
    });

    const { qrCodeData, qrCodeBase64 } = await generateQRCode(placeholderDoc.id);

    const ticketData = createTicketDocument({
      attendeeId,
      eventId,
      qrCodeData,
      qrCodeBase64,
    });

    await placeholderDoc.update(ticketData);

    // 5. Send confirmation email & in-app notification
    const attendeeSnap = await db.collection(COLLECTIONS.ATTENDEES).doc(attendeeId).get();
    const attendee     = attendeeSnap.data();

    await sendRegistrationConfirmation(attendee, event);

    await saveNotification({
      attendeeId,
      type:  'registration_confirm',
      title: `Registered: ${event.title}`,
      body:  `You're on the list for ${new Date(event.date).toDateString()}. Your QR code will be sent on the day.`,
      data:  { eventId, ticketId: placeholderDoc.id },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Your QR code will be available on the day of the event.',
      ticket: {
        id:        placeholderDoc.id,
        eventId,
        eventName: event.title,
        eventDate: event.date,
        qrCodeData,
        // Return QR image immediately so app can display it
        qrCodeBase64,
      },
    });
  } catch (err) {
    console.error('registerForEvent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tickets/my
// Attendee only. Returns all tickets (ticket history).
// ─────────────────────────────────────────────────────────────────────────────

exports.getMyTickets = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.TICKETS)
      .where('attendeeId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    // Populate event details
    const tickets = await Promise.all(
      snap.docs.map(async (d) => {
        const ticket     = { id: d.id, ...d.data() };
        const eventSnap  = await db.collection(COLLECTIONS.EVENTS).doc(ticket.eventId).get();
        ticket.event     = eventSnap.exists
          ? { id: eventSnap.id, ...eventSnap.data() }
          : null;
        return ticket;
      })
    );

    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    console.error('getMyTickets error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tickets/:ticketId/qr
// Attendee only. Returns the QR code base64 image for a specific ticket.
// ─────────────────────────────────────────────────────────────────────────────

exports.getTicketQR = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.TICKETS).doc(req.params.ticketId).get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    const ticket = snap.data();

    if (ticket.attendeeId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'This ticket does not belong to you.' });
    }

    res.status(200).json({
      success:      true,
      ticketId:     snap.id,
      qrCodeBase64: ticket.qrCodeBase64,
      qrCodeData:   ticket.qrCodeData,
      checkedIn:    ticket.checkedIn,
    });
  } catch (err) {
    console.error('getTicketQR error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tickets/:eventId/list
// Host only. Returns all registered attendees for an event.
// ─────────────────────────────────────────────────────────────────────────────

exports.getEventAttendeeList = async (req, res) => {
  try {
    // Confirm the requesting host owns this event
    const eventSnap = await db.collection(COLLECTIONS.EVENTS).doc(req.params.eventId).get();

    if (!eventSnap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (eventSnap.data().hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this event.' });
    }

    const ticketsSnap = await db.collection(COLLECTIONS.TICKETS)
      .where('eventId', '==', req.params.eventId)
      .get();

    const attendees = await Promise.all(
      ticketsSnap.docs.map(async (d) => {
        const ticket       = { id: d.id, ...d.data() };
        const attendeeSnap = await db.collection(COLLECTIONS.ATTENDEES).doc(ticket.attendeeId).get();
        const attendee     = attendeeSnap.exists ? attendeeSnap.data() : {};
        return {
          ticketId:   ticket.id,
          attendeeId: ticket.attendeeId,
          checkedIn:  ticket.checkedIn,
          checkedInAt: ticket.checkedInAt,
          fullName:   attendee.fullName,
          email:      attendee.email,
          gender:     attendee.gender,
          dob:        attendee.dob,
        };
      })
    );

    res.status(200).json({
      success:   true,
      eventId:   req.params.eventId,
      eventName: eventSnap.data().title,
      count:     attendees.length,
      attendees,
    });
  } catch (err) {
    console.error('getEventAttendeeList error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tickets/checkin
// Host only. Called by the host mobile QR scanner.
// Body: { qrCodeData }
// ─────────────────────────────────────────────────────────────────────────────

exports.checkInAttendee = async (req, res) => {
  try {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({ success: false, error: 'qrCodeData is required.' });
    }

    if (!isValidQRData(qrCodeData)) {
      return res.status(400).json({ success: false, error: 'Invalid QR code format.' });
    }

    // Find the ticket by its encoded qrCodeData string
    const ticketsSnap = await db.collection(COLLECTIONS.TICKETS)
      .where('qrCodeData', '==', qrCodeData)
      .limit(1)
      .get();

    if (ticketsSnap.empty) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    const ticketDoc = ticketsSnap.docs[0];
    const ticket    = ticketDoc.data();

    // Confirm the scanning host owns this event
    const eventSnap = await db.collection(COLLECTIONS.EVENTS).doc(ticket.eventId).get();
    if (!eventSnap.exists || eventSnap.data().hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this event.' });
    }

    if (ticket.checkedIn) {
      return res.status(409).json({
        success: false,
        error:   'Attendee already checked in.',
        checkedInAt: ticket.checkedInAt,
      });
    }

    const checkedInAt = new Date().toISOString();
    await ticketDoc.ref.update({ checkedIn: true, checkedInAt, updatedAt: checkedInAt });

    // Fetch attendee name for the response
    const attendeeSnap = await db.collection(COLLECTIONS.ATTENDEES).doc(ticket.attendeeId).get();
    const attendeeName = attendeeSnap.exists ? attendeeSnap.data().fullName : 'Unknown';

    res.status(200).json({
      success:     true,
      message:     'Check-in successful.',
      attendeeName,
      checkedInAt,
    });
  } catch (err) {
    console.error('checkInAttendee error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
