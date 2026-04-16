// src/controllers/followController.js
// ─────────────────────────────────────────────────────────────────────────────
// Follow / unfollow a host, and fetch an attendee's notifications.
// ─────────────────────────────────────────────────────────────────────────────

const { db, COLLECTIONS } = require('../config/firebase');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/follow/:hostId
// Attendee only. Follow a host to receive new-event notifications.
// ─────────────────────────────────────────────────────────────────────────────

exports.followHost = async (req, res) => {
  try {
    const { hostId }    = req.params;
    const attendeeId    = req.user.id;

    // Confirm host exists
    const hostSnap = await db.collection(COLLECTIONS.HOSTS).doc(hostId).get();
    if (!hostSnap.exists) {
      return res.status(404).json({ success: false, error: 'Host not found.' });
    }

    // Check not already following
    const existing = await db.collection(COLLECTIONS.FOLLOWS)
      .where('attendeeId', '==', attendeeId)
      .where('hostId',     '==', hostId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ success: false, error: 'Already following this host.' });
    }

    await db.collection(COLLECTIONS.FOLLOWS).add({
      attendeeId,
      hostId,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `Now following ${hostSnap.data().organizationName}.`,
    });
  } catch (err) {
    console.error('followHost error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/follow/:hostId
// Attendee only. Unfollow a host.
// ─────────────────────────────────────────────────────────────────────────────

exports.unfollowHost = async (req, res) => {
  try {
    const { hostId }  = req.params;
    const attendeeId  = req.user.id;

    const snap = await db.collection(COLLECTIONS.FOLLOWS)
      .where('attendeeId', '==', attendeeId)
      .where('hostId',     '==', hostId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ success: false, error: 'Follow record not found.' });
    }

    await snap.docs[0].ref.delete();

    res.status(200).json({ success: true, message: 'Unfollowed.' });
  } catch (err) {
    console.error('unfollowHost error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/my
// Attendee only. Returns all notifications for the current attendee,
// most recent first. Marks them as read in the background.
// ─────────────────────────────────────────────────────────────────────────────

exports.getMyNotifications = async (req, res) => {
  try {
    const snap = await db.collection(COLLECTIONS.NOTIFICATIONS)
      .where('attendeeId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Mark unread notifications as read (fire-and-forget, don't await)
    const unread = snap.docs.filter(d => !d.data().read);
    if (unread.length > 0) {
      const batch = db.batch();
      unread.forEach(d => batch.update(d.ref, { read: true }));
      batch.commit().catch(err => console.error('Batch mark-read failed:', err));
    }

    res.status(200).json({
      success: true,
      unreadCount: unread.length,
      count:       notifications.length,
      notifications,
    });
  } catch (err) {
    console.error('getMyNotifications error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
