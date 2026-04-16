// src/middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// JWT verification middleware.
// Usage:
//   router.get('/protected', protect, hostOnly, handler)
//   router.get('/attendee',  protect, attendeeOnly, handler)
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const { db, COLLECTIONS } = require('../config/firebase');

// ── protect ──────────────────────────────────────────────────────────────────
// Verifies the Bearer JWT and attaches req.user = { id, role } for downstream use.

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Include Authorization: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again.'
        : 'Invalid token.';
      return res.status(401).json({ success: false, error: message });
    }

    // Confirm the user still exists in Firestore
    const collection = decoded.role === 'host' ? COLLECTIONS.HOSTS : COLLECTIONS.ATTENDEES;
    const snap = await db.collection(collection).doc(decoded.id).get();

    if (!snap.exists) {
      return res.status(401).json({ success: false, error: 'User account no longer exists.' });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, error: 'Authentication error.' });
  }
}

// ── hostOnly ─────────────────────────────────────────────────────────────────

function hostOnly(req, res, next) {
  if (req.user?.role !== 'host') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. This endpoint is for hosts only.',
    });
  }
  next();
}

// ── attendeeOnly ─────────────────────────────────────────────────────────────

function attendeeOnly(req, res, next) {
  if (req.user?.role !== 'attendee') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. This endpoint is for attendees only.',
    });
  }
  next();
}

module.exports = { protect, hostOnly, attendeeOnly };
