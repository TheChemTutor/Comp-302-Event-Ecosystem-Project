// src/routes/events.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const {
  createEvent,
  getHostEvents,
  getEvent,
  listEvents,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, hostOnly } = require('../middleware/auth');

// Multer — store file in memory so we can pipe to Firebase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed for flyers.'));
  },
});

// Public
router.get('/',           listEvents);
router.get('/:id',        getEvent);

// Host only
router.post('/',          protect, hostOnly, upload.single('flyer'), createEvent);
router.get('/host/mine',  protect, hostOnly, getHostEvents);
router.put('/:id',        protect, hostOnly, updateEvent);
router.delete('/:id',     protect, hostOnly, deleteEvent);

module.exports = router;
