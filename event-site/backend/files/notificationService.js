// src/services/notificationService.js
// ─────────────────────────────────────────────────────────────────────────────
// Email notifications via Nodemailer + scheduled reminders via node-cron.
// ─────────────────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');
const cron       = require('node-cron');
const { db, COLLECTIONS } = require('../config/firebase');
const { createNotificationDocument } = require('../models/schemas');

// ── Email transporter ─────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use a Gmail App Password, not your main password
  },
});

// ── sendEmail ─────────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }) {
  if (!to) return; // skip if no email on file
  try {
    await transporter.sendMail({
      from: `"Event Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Log but do not crash the request — email is best-effort
    console.error(`Email send failed to ${to}:`, err.message);
  }
}

// ── sendRegistrationConfirmation ──────────────────────────────────────────────

async function sendRegistrationConfirmation(attendee, event) {
  const html = `
    <h2>You're registered! 🎉</h2>
    <p>Hi ${attendee.fullName},</p>
    <p>You have successfully registered for <strong>${event.title}</strong>.</p>
    <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
    <p><strong>Location:</strong> ${event.location || 'TBC'}</p>
    <p>Your QR code will be sent to you on the day of the event. 
       You can also access it from your ticket history in the app.</p>
    <p>See you there!</p>
  `;

  await sendEmail({
    to:      attendee.email,
    subject: `Registration Confirmed: ${event.title}`,
    html,
  });
}

// ── sendEventReminder ─────────────────────────────────────────────────────────
// Called by the daily cron job for same-day events.

async function sendEventReminder(attendee, event, qrCodeBase64) {
  const html = `
    <h2>Your event is today! 🎟️</h2>
    <p>Hi ${attendee.fullName},</p>
    <p><strong>${event.title}</strong> is happening today.</p>
    <p><strong>Location:</strong> ${event.location || 'TBC'}</p>
    <p>Show the QR code below at the entrance:</p>
    <img src="${qrCodeBase64}" alt="Your QR Code" style="width:250px;height:250px;" />
    <p>Have a great time!</p>
  `;

  await sendEmail({
    to:      attendee.email,
    subject: `Today's Event Reminder: ${event.title}`,
    html,
  });
}

// ── saveNotification ──────────────────────────────────────────────────────────
// Persists a notification to Firestore so it appears in the app's notification list.

async function saveNotification({ attendeeId, type, title, body, data }) {
  const doc = createNotificationDocument({ attendeeId, type, title, body, data });
  await db.collection(COLLECTIONS.NOTIFICATIONS).add(doc);
}

// ── scheduleDailyReminders ────────────────────────────────────────────────────
// Runs every day at 08:00 (server time).
// Finds all events happening today and emails each registered attendee their QR code.

function scheduleDailyReminders() {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰  Running daily event reminder job...');

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const eventsSnap = await db.collection(COLLECTIONS.EVENTS)
        .where('date', '>=', todayStart.toISOString())
        .where('date', '<=', todayEnd.toISOString())
        .get();

      if (eventsSnap.empty) {
        console.log('No events today.');
        return;
      }

      for (const eventDoc of eventsSnap.docs) {
        const event = { id: eventDoc.id, ...eventDoc.data() };

        const ticketsSnap = await db.collection(COLLECTIONS.TICKETS)
          .where('eventId', '==', event.id)
          .get();

        for (const ticketDoc of ticketsSnap.docs) {
          const ticket = ticketDoc.data();

          const attendeeSnap = await db.collection(COLLECTIONS.ATTENDEES)
            .doc(ticket.attendeeId)
            .get();

          if (!attendeeSnap.exists) continue;
          const attendee = attendeeSnap.data();

          // Send email reminder with QR code
          await sendEventReminder(attendee, event, ticket.qrCodeBase64);

          // Persist in-app notification
          await saveNotification({
            attendeeId: ticket.attendeeId,
            type:       'event_reminder',
            title:      `Reminder: ${event.title} is today!`,
            body:       `Your event starts at ${event.location || 'the venue'}. Your QR code is ready.`,
            data:       { eventId: event.id, ticketId: ticketDoc.id },
          });
        }
      }

      console.log('✅  Daily reminders sent.');
    } catch (err) {
      console.error('Daily reminder job failed:', err);
    }
  });

  console.log('📅  Daily reminder scheduler registered (runs at 08:00).');
}

module.exports = {
  sendEmail,
  sendRegistrationConfirmation,
  sendEventReminder,
  saveNotification,
  scheduleDailyReminders,
};
