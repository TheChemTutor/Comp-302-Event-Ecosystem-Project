// src/config/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase Admin SDK initialisation.
// All other files import { db, auth, storage } from this module.
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
require('dotenv').config();

// Build the service account credential from individual env vars
// (avoids needing a JSON file in the repo)
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  // Env vars escape newlines as \n — restore real newlines here
  private_key: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
};

// Only initialise once (guards against hot-reload double-init in dev)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log('✅  Firebase Admin SDK initialised');
}

const db      = admin.firestore();     // Firestore (main database)
const auth    = admin.auth();          // Firebase Auth (token verification)
const storage = admin.storage();       // Cloud Storage (flyer images)
const bucket  = storage.bucket();

// Firestore collection name constants — one source of truth
const COLLECTIONS = {
  HOSTS:         'hosts',
  ATTENDEES:     'attendees',
  EVENTS:        'events',
  TICKETS:       'tickets',
  NOTIFICATIONS: 'notifications',
  FOLLOWS:       'follows',
};

module.exports = { admin, db, auth, storage, bucket, COLLECTIONS };
