// src/controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles: host register/login, attendee register/login, /me endpoint.
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { db, COLLECTIONS } = require('../config/firebase');
const {
  createHostDocument,
  createAttendeeDocument,
} = require('../models/schemas');

// ── Utility: sign a JWT ───────────────────────────────────────────────────────

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ── Utility: generate username from org name ──────────────────────────────────

function generateUsername(organizationName) {
  const base = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}${suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/host/register
// Body: { organizationName, email }
// Returns: { username, password }  ← shown once, host saves these to log in
// ─────────────────────────────────────────────────────────────────────────────

exports.registerHost = async (req, res) => {
  try {
    const { organizationName, email } = req.body;

    if (!organizationName || !email) {
      return res.status(400).json({
        success: false,
        error: 'organizationName and email are required.',
      });
    }

    // Check email uniqueness
    const existing = await db.collection(COLLECTIONS.HOSTS)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    // Generate credentials
    const username        = generateUsername(organizationName);
    const plainPassword   = Math.random().toString(36).slice(-10); // 10-char random password
    const passwordHash    = await bcrypt.hash(plainPassword, 12);

    const hostData = createHostDocument({ organizationName, email, username, passwordHash });
    const docRef   = await db.collection(COLLECTIONS.HOSTS).add(hostData);

    res.status(201).json({
      success:  true,
      message:  'Host registered. Save these credentials — the password will not be shown again.',
      data: {
        id:       docRef.id,
        username,
        password: plainPassword, // shown ONCE
      },
    });
  } catch (err) {
    console.error('registerHost error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/host/login
// Body: { username, password }
// Returns: JWT token
// ─────────────────────────────────────────────────────────────────────────────

exports.loginHost = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'username and password are required.' });
    }

    const snap = await db.collection(COLLECTIONS.HOSTS)
      .where('username', '==', username.toLowerCase())
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const hostDoc  = snap.docs[0];
    const hostData = hostDoc.data();

    const passwordMatch = await bcrypt.compare(password, hostData.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = signToken(hostDoc.id, 'host');

    res.status(200).json({
      success: true,
      token,
      user: {
        id:               hostDoc.id,
        role:             'host',
        username:         hostData.username,
        organizationName: hostData.organizationName,
        email:            hostData.email,
      },
    });
  } catch (err) {
    console.error('loginHost error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/attendee/register
// Body: { fullName, dob, gender, email?, phone? }
// Returns: generated UID (shown once — used to log in)
// ─────────────────────────────────────────────────────────────────────────────

exports.registerAttendee = async (req, res) => {
  try {
    const { fullName, dob, gender, email, phone } = req.body;

    if (!fullName || !dob || !gender) {
      return res.status(400).json({
        success: false,
        error: 'fullName, dob, and gender are required.',
      });
    }

    const attendeeData = createAttendeeDocument({ fullName, dob, gender, email, phone });
    const docRef       = await db.collection(COLLECTIONS.ATTENDEES).add(attendeeData);

    res.status(201).json({
      success: true,
      message: 'Attendee registered. Save your UID — it is used to log in and will not be shown again.',
      data: {
        id:  docRef.id,
        uid: attendeeData.uid, // shown ONCE
      },
    });
  } catch (err) {
    console.error('registerAttendee error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/attendee/login
// Body: { uid }
// Returns: JWT token
// ─────────────────────────────────────────────────────────────────────────────

exports.loginAttendee = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ success: false, error: 'uid is required.' });
    }

    const snap = await db.collection(COLLECTIONS.ATTENDEES)
      .where('uid', '==', uid)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(401).json({ success: false, error: 'Invalid UID.' });
    }

    const attendeeDoc  = snap.docs[0];
    const attendeeData = attendeeDoc.data();

    const token = signToken(attendeeDoc.id, 'attendee');

    res.status(200).json({
      success: true,
      token,
      user: {
        id:       attendeeDoc.id,
        role:     'attendee',
        fullName: attendeeData.fullName,
        email:    attendeeData.email,
      },
    });
  } catch (err) {
    console.error('loginAttendee error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Protected — requires Bearer JWT
// Returns the current user's profile
// ─────────────────────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    const collection   = role === 'host' ? COLLECTIONS.HOSTS : COLLECTIONS.ATTENDEES;
    const snap         = await db.collection(collection).doc(id).get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const data = snap.data();
    // Strip the password hash before returning
    delete data.passwordHash;

    res.status(200).json({ success: true, user: { id: snap.id, ...data } });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
