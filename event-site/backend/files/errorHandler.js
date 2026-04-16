// src/middleware/errorHandler.js
// ─────────────────────────────────────────────────────────────────────────────
// Global Express error handler — catches anything passed to next(err).
// Must be the LAST middleware registered in app.js.
// ─────────────────────────────────────────────────────────────────────────────

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message    || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// ── 404 handler ───────────────────────────────────────────────────────────────
// Register BEFORE errorHandler but AFTER all routes.

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
