# Event Ecosystem — Backend API

Node.js + Express.js REST API for the Delta Group Event Ecosystem.  
Connects the React web app (host dashboard) and React Native mobile app (attendees) to Firebase (Firestore + Storage).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | Firebase Firestore |
| File Storage | Firebase Cloud Storage |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| QR Codes | qrcode (npm) |
| Email | Nodemailer (Gmail) |
| Scheduled Jobs | node-cron |
| Security | helmet, cors, express-rate-limit |

---

## Project Structure

```
event-ecosystem-backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK init
│   ├── models/
│   │   └── schemas.js           # Firestore document factories + validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── tickets.js
│   │   ├── analytics.js
│   │   └── follow.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── analyticsController.js
│   │   └── followController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT protect, hostOnly, attendeeOnly
│   │   └── errorHandler.js      # Global error + 404 handlers
│   ├── services/
│   │   ├── qrService.js         # QR code generation + validation
│   │   └── notificationService.js # Email + cron reminders + Firestore notifications
│   └── app.js                   # Express setup + server start
├── .env.example                 # Copy to .env and fill in values
├── .gitignore
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- Firebase project credentials (from Firebase Console → Project Settings → Service Accounts)
- JWT secret (any long random string)
- Gmail credentials for email notifications

### 3. Firebase setup checklist
- Enable **Firestore** in your Firebase project
- Enable **Cloud Storage**
- Go to **Project Settings → Service Accounts → Generate New Private Key**
- Copy the values into your `.env`

### 4. Run the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`  
Health check: `GET http://localhost:3000/api/health`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

The JWT is returned by the login endpoints. Tokens expire after 7 days.

---

## API Reference

### Health

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Server status check |

---

### Auth Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/host/register` | None | Register a host. Returns generated `username` + `password` (shown once). |
| POST | `/api/auth/host/login` | None | Host login with `username` + `password`. Returns JWT. |
| POST | `/api/auth/attendee/register` | None | Register attendee. Returns generated `uid` (shown once). |
| POST | `/api/auth/attendee/login` | None | Attendee login with `uid`. Returns JWT. |
| GET | `/api/auth/me` | JWT | Returns current user profile. |

#### POST `/api/auth/host/register`
```json
// Request body
{ "organizationName": "Campus Events Co", "email": "host@example.com" }

// Response 201
{
  "success": true,
  "message": "Host registered. Save these credentials — the password will not be shown again.",
  "data": { "id": "abc123", "username": "campuse1234", "password": "xk9z2qr7mw" }
}
```

#### POST `/api/auth/host/login`
```json
// Request body
{ "username": "campuse1234", "password": "xk9z2qr7mw" }

// Response 200
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "abc123", "role": "host", "username": "campuse1234", "organizationName": "Campus Events Co" }
}
```

#### POST `/api/auth/attendee/register`
```json
// Request body
{ "fullName": "Jane Doe", "dob": "1999-04-15", "gender": "female", "email": "jane@example.com", "phone": "+26771234567" }

// Response 201
{
  "success": true,
  "message": "Attendee registered. Save your UID — it is used to log in and will not be shown again.",
  "data": { "id": "def456", "uid": "550e8400-e29b-41d4-a716-446655440000" }
}
```

#### POST `/api/auth/attendee/login`
```json
// Request body
{ "uid": "550e8400-e29b-41d4-a716-446655440000" }

// Response 200
{ "success": true, "token": "eyJhbGci...", "user": { "id": "def456", "role": "attendee", "fullName": "Jane Doe" } }
```

---

### Event Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | None | List all upcoming events. Query: `?category=&location=&date=&search=` |
| GET | `/api/events/:id` | None | Get a single event by ID. |
| GET | `/api/events/host/mine` | Host JWT | All events created by the logged-in host. |
| POST | `/api/events` | Host JWT | Create a new event. Accepts `multipart/form-data` with optional `flyer` image. |
| PUT | `/api/events/:id` | Host JWT | Update an event (only if not yet occurred). |
| DELETE | `/api/events/:id` | Host JWT | Delete an event. |

#### POST `/api/events` (multipart/form-data)
```
title         = "Spring Gala 2025"
description   = "Annual spring celebration"
date          = "2025-09-20T18:00:00.000Z"
location      = "UB Main Hall"
category      = "social"
dressCode     = "formal"
capacity      = 200
flyer         = <image file, optional>
```

---

### Ticket Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/tickets/register/:eventId` | Attendee JWT | Register for an event. Returns ticket + QR code. |
| GET | `/api/tickets/my` | Attendee JWT | Get all tickets (ticket history). |
| GET | `/api/tickets/:ticketId/qr` | Attendee JWT | Get QR code image for a specific ticket. |
| GET | `/api/tickets/:eventId/list` | Host JWT | Get attendee list for an event. |
| POST | `/api/tickets/checkin` | Host JWT | Check in attendee via QR scan. |

#### POST `/api/tickets/register/:eventId`
```json
// No body needed — attendee ID comes from JWT

// Response 201
{
  "success": true,
  "ticket": {
    "id": "ticket789",
    "eventId": "event456",
    "eventName": "Spring Gala 2025",
    "eventDate": "2025-09-20T18:00:00.000Z",
    "qrCodeData": "EH-TICKET-ticket789",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

#### POST `/api/tickets/checkin`
```json
// Request body (sent by host mobile QR scanner after scanning)
{ "qrCodeData": "EH-TICKET-ticket789" }

// Response 200
{ "success": true, "message": "Check-in successful.", "attendeeName": "Jane Doe", "checkedInAt": "2025-09-20T18:15:00.000Z" }
```

---

### Analytics Endpoints (Host only)

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/host/overview` | Host JWT | Aggregated stats across all host events. |
| GET | `/api/analytics/event/:eventId` | Host JWT | Deep stats for a single event. |

#### GET `/api/analytics/event/:eventId` — Example response
```json
{
  "success": true,
  "analytics": {
    "eventId": "event456",
    "eventTitle": "Spring Gala 2025",
    "totalRegistrations": 150,
    "checkedIn": 112,
    "checkInRate": "74.7%",
    "genderCounts": { "male": 70, "female": 72, "other": 8 },
    "ageBrackets": { "under18": 5, "age18to34": 120, "age35plus": 25, "unknown": 0 }
  }
}
```

---

### Follow & Notifications (Attendee only)

| Method | URL | Auth | Description |
|---|---|---|---|
| POST | `/api/follow/:hostId` | Attendee JWT | Follow a host. |
| DELETE | `/api/follow/:hostId` | Attendee JWT | Unfollow a host. |
| GET | `/api/notifications/my` | Attendee JWT | Get all notifications (marks as read). |

---

## Standard Error Response

All errors return the same shape so the frontend can handle them consistently:
```json
{ "success": false, "error": "Human-readable error message here." }
```

Common status codes:
- `400` — Bad request / validation error
- `401` — Not authenticated (missing or expired token)
- `403` — Forbidden (wrong role)
- `404` — Resource not found
- `409` — Conflict (duplicate registration, etc.)
- `500` — Server error

---

## Firestore Collections

| Collection | Description |
|---|---|
| `hosts` | Host accounts |
| `attendees` | Attendee accounts |
| `events` | Events created by hosts |
| `tickets` | Registration records + QR codes |
| `notifications` | In-app notifications for attendees |
| `follows` | Attendee → Host follow relationships |

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12) — never stored in plain text.
- JWTs are signed with `JWT_SECRET` from `.env` — never hard-coded.
- Rate limiting: 200 req/15 min globally, 20 req/15 min on auth endpoints.
- CORS is restricted to `WEB_APP_URL` and `MOBILE_APP_URL` from `.env`.
- Helmet sets secure HTTP headers automatically.
- `.env` is in `.gitignore` — never commit secrets.

---

## Daily Reminder Cron Job

At 08:00 every day, the server automatically:
1. Finds all events scheduled for today.
2. Fetches every registered attendee for those events.
3. Emails each attendee their QR code.
4. Saves an in-app notification visible in the mobile app.
