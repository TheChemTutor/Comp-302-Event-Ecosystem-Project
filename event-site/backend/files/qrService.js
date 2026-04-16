// src/services/qrService.js
// ─────────────────────────────────────────────────────────────────────────────
// QR code generation and verification helpers.
// QR codes encode a unique ticket reference string.
// The host scanner sends that string back; we look it up to mark check-in.
// ─────────────────────────────────────────────────────────────────────────────

const QRCode = require('qrcode');

// Prefix makes ticket strings unmistakeable in scanner output
const QR_PREFIX = 'EH-TICKET';

// ── generateQRCode ────────────────────────────────────────────────────────────
// Returns:
//   qrCodeData    – plain string stored in the ticket document (used for lookup)
//   qrCodeBase64  – data:image/png;base64,... ready to send to the mobile app

async function generateQRCode(ticketId) {
  const qrCodeData = `${QR_PREFIX}-${ticketId}`;

  const qrCodeBase64 = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: 'H', // highest redundancy — still scannable if partly damaged
    type: 'image/png',
    width: 400,
    margin: 2,
    color: {
      dark:  '#000000',
      light: '#FFFFFF',
    },
  });

  return { qrCodeData, qrCodeBase64 };
}

// ── isValidQRData ─────────────────────────────────────────────────────────────
// Quick sanity check before a database lookup.

function isValidQRData(str) {
  return typeof str === 'string' && str.startsWith(QR_PREFIX + '-');
}

// ── extractTicketId ───────────────────────────────────────────────────────────
// Strips the prefix to get the raw Firestore document ID.

function extractTicketId(qrCodeData) {
  return qrCodeData.replace(`${QR_PREFIX}-`, '');
}

module.exports = { generateQRCode, isValidQRData, extractTicketId };
