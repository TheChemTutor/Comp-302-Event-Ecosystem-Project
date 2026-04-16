// src/controllers/eventController.js
// ─────────────────────────────────────────────────────────────────────────────
// Host event management: create, read, update, delete.
// Public listing for attendee browsing.
// ─────────────────────────────────────────────────────────────────────────────

const { db, bucket, COLLECTIONS } = require('../config/firebase');
const { createEventDocument } = require('../models/schemas');
const { saveNotification }    = require('../services/notificationService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/events
// Host only. Creates a new event.
// ─────────────────────────────────────────────────────────────────────────────

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, dressCode, capacity } = req.body;

    // Handle flyer upload if file was attached (via multer)
    let flyerUrl = null;
    if (req.file) {
      const blob = bucket.file(`flyers/${Date.now()}_${req.file.originalname}`);
      await blob.save(req.file.buffer, { contentType: req.file.mimetype });
      await blob.makePublic();
      flyerUrl = blob.publicUrl();
    }

    const eventData = createEventDocument({
      hostId: req.user.id,
      title, description, date, location,
      category, dressCode, flyerUrl, capacity,
    });

    const docRef = await db.collection(COLLECTIONS.EVENTS).add(eventData);

    // Notify followers of the host
    await _notifyFollowers(req.user.id, docRef.id, eventData);

    res.status(201).json({
      success: true,
      event: { id: docRef.id, ...eventData },
    });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/host
// Host only. Returns all events created by the logged-in host.
// ─────────────────────────────────────────────────────────────────────────────

exports.getHostEvents = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.EVENTS)
      .where('hostId', '==', req.user.id)
      .orderBy('date', 'desc')
      .get();

    const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    console.error('getHostEvents error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events/:id
// Public. Returns a single event by ID.
// ─────────────────────────────────────────────────────────────────────────────

exports.getEvent = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.EVENTS).doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    res.status(200).json({ success: true, event: { id: snap.id, ...snap.data() } });
  } catch (err) {
    console.error('getEvent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/events
// Public. List all upcoming events with optional filters.
// Query params: ?category=&location=&date=&search=
// ─────────────────────────────────────────────────────────────────────────────

exports.listEvents = async (req, res) => {
  try {
    let query = db.collection(COLLECTIONS.EVENTS)
      .where('status', '==', 'upcoming')
      .orderBy('date', 'asc');

    if (req.query.category) {
      query = query.where('category', '==', req.query.category);
    }

    const snap   = await query.get();
    let events = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // In-memory filters (Firestore doesn't support compound OR queries)
    if (req.query.location) {
      const loc = req.query.location.toLowerCase();
      events = events.filter(e => e.location?.toLowerCase().includes(loc));
    }

    if (req.query.date) {
      events = events.filter(e => e.date?.startsWith(req.query.date));
    }

    if (req.query.search) {
      const term = req.query.search.toLowerCase();
      events = events.filter(e =>
        e.title?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term)
      );
    }

    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    console.error('listEvents error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/events/:id
// Host only. Update an event — only allowed before it has occurred.
// ─────────────────────────────────────────────────────────────────────────────

exports.updateEvent = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.EVENTS).doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    const event = snap.data();

    if (event.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this event.' });
    }

    if (event.status === 'past') {
      return res.status(400).json({ success: false, error: 'Cannot edit a past event.' });
    }

    const allowedFields = ['title', 'description', 'date', 'location', 'category', 'dressCode', 'capacity'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    updates.updatedAt = new Date().toISOString();

    await db.collection(COLLECTIONS.EVENTS).doc(req.params.id).update(updates);

    // Notify registered attendees of the change
    await _notifyRegisteredAttendees(req.params.id, event.title);

    res.status(200).json({ success: true, message: 'Event updated.', updates });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id
// Host only.
// ─────────────────────────────────────────────────────────────────────────────

exports.deleteEvent = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.EVENTS).doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    if (snap.data().hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this event.' });
    }

    await db.collection(COLLECTIONS.EVENTS).doc(req.params.id).delete();

    res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── Private helpers ───────────────────────────────────────────────────────────

async function _notifyFollowers(hostId, eventId, eventData) {
  try {
    const followsSnap = await db.collection(COLLECTIONS.FOLLOWS)
      .where('hostId', '==', hostId)
      .get();

    const saves = followsSnap.docs.map(d =>
      saveNotification({
        attendeeId: d.data().attendeeId,
        type:       'new_event',
        title:      `New event from a host you follow!`,
        body:       `${eventData.title} on ${new Date(eventData.date).toDateString()}`,
        data:       { eventId },
      })
    );

    await Promise.all(saves);
  } catch (err) {
    console.error('_notifyFollowers error:', err);
  }
}

async function _notifyRegisteredAttendees(eventId, eventTitle) {
  try {
    const ticketsSnap = await db.collection(COLLECTIONS.TICKETS)
      .where('eventId', '==', eventId)
      .get();

    const saves = ticketsSnap.docs.map(d =>
      saveNotification({
        attendeeId: d.data().attendeeId,
        type:       'event_update',
        title:      `Event updated: ${eventTitle}`,
        body:       'Details for an event you registered for have changed. Check the app.',
        data:       { eventId },
      })
    );

    await Promise.all(saves);
  } catch (err) {
    console.error('_notifyRegisteredAttendees error:', err);
  }
}
