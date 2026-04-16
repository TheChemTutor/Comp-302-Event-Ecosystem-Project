// src/app.js
// ─────────────────────────────────────────────────────────────────────────────
// Delta Event Ecosystem — Express API entry point
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const eventRoutes     = require('./routes/events');
const ticketRoutes    = require('./routes/tickets');
const analyticsRoutes = require('./routes/analytics');
const followRoutes    = require('./routes/follow');

// ── Middleware ─────────────────────────────────────────────────────────────────
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ── Services ──────────────────────────────────────────────────────────────────
const { scheduleDailyReminders } = require('./services/notificationService');

// Initialise Firebase (side-effect import — runs once)
require('./config/firebase');

// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.WEB_APP_URL   || 'http://localhost:3001',
  process.env.MOBILE_APP_URL || 'http://localhost:19006',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));           // JSON body (base64 images can be large)
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Global rate limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Stricter limiter for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ─────────────────────────────────────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status:  'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/events',     eventRoutes);
app.use('/api/tickets',    ticketRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api',            followRoutes);     // covers /api/follow and /api/notifications

// ── 404 and error handlers (must be last) ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀  Event Ecosystem API running on port ${PORT}`);
  console.log(`    ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Health: http://localhost:${PORT}/api/health\n`);

  // Start the daily reminder cron job
  scheduleDailyReminders();
});

module.exports = app; // exported for testing
