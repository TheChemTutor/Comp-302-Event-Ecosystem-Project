// src/controllers/analyticsController.js
// ─────────────────────────────────────────────────────────────────────────────
// Host-only analytics: overview dashboard + per-event deep dive.
// ─────────────────────────────────────────────────────────────────────────────

const { db, COLLECTIONS } = require('../config/firebase');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/host/overview
// Returns aggregated stats for the logged-in host across all events.
// ─────────────────────────────────────────────────────────────────────────────

exports.getHostOverview = async (req, res) => {
  try {
    const eventsSnap = await db.collection(COLLECTIONS.EVENTS)
      .where('hostId', '==', req.user.id)
      .get();

    const events      = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalEvents = events.length;
    const pastEvents  = events.filter(e => e.status === 'past');

    // Count total registrations across all events
    let totalRegistrations = 0;
    let totalCheckedIn     = 0;

    const ticketCounts = await Promise.all(
      events.map(async (event) => {
        const tSnap      = await db.collection(COLLECTIONS.TICKETS)
          .where('eventId', '==', event.id)
          .get();
        const checkedIn  = tSnap.docs.filter(d => d.data().checkedIn).length;
        totalRegistrations += tSnap.size;
        totalCheckedIn     += checkedIn;
        return { eventId: event.id, eventTitle: event.title, registrations: tSnap.size, checkedIn };
      })
    );

    const avgAttendance = pastEvents.length
      ? (totalCheckedIn / pastEvents.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      overview: {
        totalEvents,
        upcomingEvents:    events.filter(e => e.status === 'upcoming').length,
        pastEvents:        pastEvents.length,
        totalRegistrations,
        totalCheckedIn,
        avgAttendancePerPastEvent: Number(avgAttendance),
        eventBreakdown: ticketCounts,
      },
    });
  } catch (err) {
    console.error('getHostOverview error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/event/:eventId
// Returns deep statistics for a single event.
// ─────────────────────────────────────────────────────────────────────────────

exports.getEventAnalytics = async (req, res) => {
  try {
    const eventSnap = await db.collection(COLLECTIONS.EVENTS).doc(req.params.eventId).get();

    if (!eventSnap.exists) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    const event = { id: eventSnap.id, ...eventSnap.data() };

    if (event.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You do not own this event.' });
    }

    const ticketsSnap = await db.collection(COLLECTIONS.TICKETS)
      .where('eventId', '==', req.params.eventId)
      .get();

    const tickets    = ticketsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const checkedIn  = tickets.filter(t => t.checkedIn).length;
    const checkInRate = tickets.length
      ? ((checkedIn / tickets.length) * 100).toFixed(1)
      : '0.0';

    // Populate attendee data for demographic breakdown
    const attendeeIds = [...new Set(tickets.map(t => t.attendeeId))];
    const attendeeDocs = await Promise.all(
      attendeeIds.map(id => db.collection(COLLECTIONS.ATTENDEES).doc(id).get())
    );
    const attendeeMap = {};
    attendeeDocs.forEach(snap => {
      if (snap.exists) attendeeMap[snap.id] = snap.data();
    });

    // Gender split
    const genderCounts = { male: 0, female: 0, other: 0, prefer_not_to_say: 0, unknown: 0 };
    tickets.forEach(t => {
      const gender = attendeeMap[t.attendeeId]?.gender || 'unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    // Age brackets at event date
    const eventDate   = new Date(event.date);
    const ageBrackets = { under18: 0, age18to34: 0, age35plus: 0, unknown: 0 };

    tickets.forEach(t => {
      const dob = attendeeMap[t.attendeeId]?.dob;
      if (!dob) { ageBrackets.unknown++; return; }
      const ageMsec = eventDate - new Date(dob);
      const age     = ageMsec / (1000 * 60 * 60 * 24 * 365.25);
      if      (age < 18)  ageBrackets.under18++;
      else if (age < 35)  ageBrackets.age18to34++;
      else                ageBrackets.age35plus++;
    });

    res.status(200).json({
      success: true,
      analytics: {
        eventId:       event.id,
        eventTitle:    event.title,
        eventDate:     event.date,
        totalRegistrations: tickets.length,
        checkedIn,
        checkInRate:   `${checkInRate}%`,
        waitlisted:    tickets.length - checkedIn,
        genderCounts,
        ageBrackets,
      },
    });
  } catch (err) {
    console.error('getEventAnalytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
