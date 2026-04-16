// src/models/schemas.js
// ─────────────────────────────────────────────────────────────────────────────
// Firestore is schema-less, but we define and validate our data shapes here.
// Each factory function returns a plain object ready to pass to Firestore.
// ─────────────────────────────────────────────────────────────────────────────

const { v4: uuidv4 } = require('uuid');

// ── VALIDATION HELPERS ──────────────────────────────────────────────────────

function required(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }
  return value;
}

function oneOf(value, allowed, fieldName) {
  if (!allowed.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

// ── HOST SCHEMA ──────────────────────────────────────────────────────────────
// Represents an event organiser (web app user).
// Firestore collection: 'hosts'

function createHostDocument({ organizationName, email, username, passwordHash }) {
  return {
    organizationName: required(organizationName, 'organizationName'),
    email:            required(email,            'email').toLowerCase(),
    username:         required(username,         'username').toLowerCase(),
    passwordHash:     required(passwordHash,     'passwordHash'),
    role:             'host',
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };
}

// ── ATTENDEE SCHEMA ──────────────────────────────────────────────────────────
// Represents a mobile app user who attends events.
// Firestore collection: 'attendees'
// uid is the auto-generated login credential (shown once, then private).

function createAttendeeDocument({ fullName, dob, gender, email, phone }) {
  return {
    uid:      uuidv4(),          // unique private UID used for login
    fullName: required(fullName, 'fullName'),
    dob:      required(dob,      'dob'),       // ISO date string e.g. "1999-04-15"
    gender:   oneOf(gender, ['male', 'female', 'other', 'prefer_not_to_say'], 'gender'),
    email:    email  || null,
    phone:    phone  || null,
    role:     'attendee',
    followedHosts: [],           // array of host document IDs
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ── EVENT SCHEMA ─────────────────────────────────────────────────────────────
// Created by a host.
// Firestore collection: 'events'

function createEventDocument({
  hostId, title, description, date, location,
  category, dressCode, flyerUrl, capacity,
}) {
  return {
    hostId:      required(hostId,  'hostId'),
    title:       required(title,   'title'),
    description: description || '',
    date:        required(date,    'date'),   // ISO date string
    location:    location  || '',
    category:    category  || 'general',
    dressCode:   dressCode || 'casual',
    flyerUrl:    flyerUrl  || null,
    capacity:    capacity  ? Number(capacity) : null,
    status:      new Date(date) > new Date() ? 'upcoming' : 'past',
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };
}

// ── TICKET SCHEMA ─────────────────────────────────────────────────────────────
// Created when an attendee registers for an event.
// Firestore collection: 'tickets'

function createTicketDocument({ attendeeId, eventId, qrCodeData, qrCodeBase64 }) {
  return {
    attendeeId:   required(attendeeId,  'attendeeId'),
    eventId:      required(eventId,     'eventId'),
    qrCodeData:   required(qrCodeData,  'qrCodeData'),  // plain string encoded in QR
    qrCodeBase64: qrCodeBase64 || null,                 // base64 PNG for display
    checkedIn:    false,
    checkedInAt:  null,
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };
}

// ── NOTIFICATION SCHEMA ───────────────────────────────────────────────────────
// Stored per-attendee in Firestore.
// Firestore collection: 'notifications'

function createNotificationDocument({ attendeeId, type, title, body, data }) {
  return {
    attendeeId: required(attendeeId, 'attendeeId'),
    type:       oneOf(type, ['event_reminder', 'new_event', 'event_update', 'registration_confirm'], 'type'),
    title:      required(title, 'title'),
    body:       body || '',
    data:       data || {},         // extra payload (e.g. eventId, ticketId)
    read:       false,
    createdAt:  new Date().toISOString(),
  };
}

module.exports = {
  createHostDocument,
  createAttendeeDocument,
  createEventDocument,
  createTicketDocument,
  createNotificationDocument,
};
