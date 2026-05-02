# Event Horizon
### Unified Event & Workshop Ecosystem — Group Delta
**COMP 302 | Data Structures and Algorithms Project**
**Botswana International University of Science and Technology (BIUST)**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Team](#team)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Rubric Mapping](#rubric-mapping)
8. [Future Development](#future-development)

---

## Project Overview

Event Horizon is a full-stack web application that bridges the gap between remote event registration and physical attendance tracking. It provides a seamless experience for both event attendees and hosts.

**The Problem:** Event hosts lack a streamlined way to manage registrations and track physical attendance. Manual data collection for post-event analytics (age and gender demographics) is inefficient and error-prone.

**The Solution:** A Progressive Web App (PWA) that allows attendees to discover, register, and check in to events using QR codes, while giving hosts a real-time analytics dashboard with demographic insights.

---

## Team

| Name | Role |
|---|---|
| Sean Takunda Kuwali | Backend / Project Lead |
| Mary A. Santos | Frontend |
| Onneile Kgwatalala | Frontend |
| Ahmed B. Ahmed | Database |
| Senatla Lekang | Database |
| Mooketsi Moiteelasilo | Backend |
| Malau Malau | Admin / Documentation |
| Kago Motheo Basinyi | Admin / Documentation |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Database | Firebase Realtime Database |
| Authentication | Firebase Auth (Email + Google) |
| QR Codes | qrcode.react, html5-qrcode |
| Routing | React Router v7 |
| Styling | CSS Modules (component-scoped) |
| PWA | Web App Manifest |

---

## Features

### Attendee Features
- **Sign up / Sign in** via email or Google OAuth
- **Browse events** from Firebase Realtime Database
- **Filter events** by category, price, and search term
- **Register for events** with ticket selection and capacity enforcement
- **Individual & Group tickets** — group tickets cover up to 20 people
- **Cart system** — add tickets from multiple events and checkout at once
- **QR code tickets** — generated per ticket, shown on ticket detail page
- **Ticket history** — view upcoming, past, and waitlisted tickets
- **Waitlist** — join waitlist when events are full, see position in queue
- **Event ratings** — rate events you attended (1–5 stars)
- **Follow hosts** — follow event hosts and see their events prominently
- **In-app notifications** — ticket confirmations, event updates, waitlist alerts
- **Responsive design** — works on desktop and mobile
- **PWA** — installable on mobile devices

### Host Features
- **Host dashboard** — overview of all events with stats
- **Create events** — with title, venue, date, category, capacity, flyer, ticket types
- **Edit events** — update details, ticket types, visibility
- **Delete events** — with confirmation to prevent accidents
- **Attendee list** — full list with name, gender, age, ticket type, check-in status
- **QR scanner** — scan attendee QR codes to check them in
- **Analytics dashboard** — revenue, fill rate, check-in rate, gender breakdown, age breakdown, event rating

---

## Project Structure

```
src/
├── assets/                        # Images and static files
├── components/
│   ├── Navbar.jsx                 # Global navigation
│   └── Navbar.css
├── context/
│   └── CartContext.jsx            # Cart state management
├── pages/
│   ├── auth/
│   │   ├── login.jsx              # Sign in page
│   │   ├── login.css
│   │   ├── register.jsx           # Sign up page
│   │   └── register.css
│   ├── guest/
│   │   ├── home.jsx               # Event discovery (responsive)
│   │   ├── home.css
│   │   ├── eventDetail.jsx        # Event page + ticket purchase
│   │   ├── eventDetail.css
│   │   ├── search.jsx             # Search + filter events
│   │   ├── search.css
│   │   ├── ticketHistory.jsx      # My tickets (upcoming/past/waitlisted)
│   │   ├── ticketHistory.css
│   │   ├── ticketDetail.jsx       # Individual ticket + QR code
│   │   ├── ticketDetail.css
│   │   ├── waitlist.jsx           # My waitlist entries
│   │   ├── waitlist.css
│   │   ├── notifications.jsx      # In-app notifications
│   │   └── notifications.css
│   ├── host/
│   │   ├── dashboard.jsx          # Host event management
│   │   ├── dashboard.css
│   │   ├── createEvent.jsx        # Create new event
│   │   ├── createEvent.css
│   │   ├── editEvent.jsx          # Edit existing event
│   │   ├── editEvent.css
│   │   ├── attendeeList.jsx       # Attendee list + check-in
│   │   ├── attendeeList.css
│   │   ├── analytics.jsx          # Event analytics dashboard
│   │   ├── analytics.css
│   │   ├── scanner.jsx            # QR code scanner
│   │   └── scanner.css
│   ├── cart.jsx                   # Shopping cart
│   ├── cart.css
│   └── notFound.jsx               # 404 page
├── services/                      # All Firebase logic (no Firebase imports in pages)
│   ├── firebase.js                # Firebase initialization
│   ├── auth.js                    # Authentication service
│   ├── events.js                  # Events CRUD
│   ├── tickets.js                 # Ticket registration + check-in
│   ├── waitlist.js                # Waitlist management
│   ├── notifications.js           # In-app notifications
│   ├── ratings.js                 # Event ratings
│   ├── follows.js                 # Follow host feature
│   └── users.js                   # User profile management
├── styles/
│   └── colors.css                 # Global color variables
├── App.jsx                        # Routes
├── main.jsx                       # App entry point
└── index.css                      # Global styles
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm
- A Firebase project with Realtime Database enabled

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd event-site
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase setup
- Enable **Realtime Database** in your Firebase project
- Enable **Authentication** — turn on Email/Password and Google providers
- Set database rules to allow authenticated reads/writes

### 5. Run the development server
```bash
npm run dev
```

### 6. Run on mobile (same network)
```bash
npm run dev -- --host
```
Then open the network URL shown in terminal on your phone.

---

## Rubric Mapping

| # | Rubric Item | Marks | Implementation |
|---|---|---|---|
| 1 | User can sign up | 5 | `pages/auth/register.jsx` + `services/auth.js` — email & Google OAuth |
| 2 | User can sign in | 5 | `pages/auth/login.jsx` + `services/auth.js` — email & Google OAuth |
| 3 | Host adds event to NoSQL | 10 | `pages/host/createEvent.jsx` + `services/events.js` → Firebase Realtime Database |
| 4 | User views events from NoSQL | 10 | `pages/guest/home.jsx` + `services/events.js` → `getAllEvents()` |
| 5 | User filters events by category | 12 | `pages/guest/search.jsx` — filter by category, price, search term |
| 6 | User registers for event | 5 | `pages/guest/eventDetail.jsx` + `services/tickets.js` — with capacity enforcement |
| 7 | Admin edits event | 5 | `pages/host/editEvent.jsx` + `services/events.js` → `updateEvent()` |
| 8 | Admin deletes event | 5 | `pages/host/editEvent.jsx` Danger Zone tab + `services/events.js` → `deleteEvent()` |
| 9 | User adds events to cart | 5 | `pages/cart.jsx` + `context/CartContext.jsx` — multi-event cart with checkout |
| 10 | Extras | 15 | QR code tickets, in-app notifications, waitlist system, attendee check-in, analytics |
| 11 | Innovation | 20 | Follow host feature, event ratings, QR scanner, group tickets, PWA, demographic analytics |
| 12 | Teamwork | 3 | Meeting minutes, documented sprints, role-based contributions |

---

## Data Structure (Firebase Realtime Database)

```
/users/{userId}
  fullName, email, dob, gender, phone, createdAt

/events/{eventId}
  title, description, venue, startDate, startTime, endDate, endTime
  category, visibility, capacity, flyerUrl, ticketTypes[]
  hostId, hostName, status, price, createdAt

/tickets/{ticketId}
  eventId, userId, ticketType, price, groupSize
  purchasedAt, checkedIn, checkedInAt, attendedCount, qrCode

/waitlist/{eventId}/{userId}
  joinedAt, status

/notifications/{userId}/{notificationId}
  type, title, body, read, createdAt, eventId

/ratings/{eventId}/{userId}
  rating, createdAt

/follows/{userId}/{hostId}
  followedAt
```

---

## Future Development

- Full native mobile application (React Native)
- Email notifications — ticket confirmation and event reminders
- Comment section for events
- Group ticket survey — collect individual details within a group booking
- Notification triggers based on event rating thresholds
- Payment gateway integration
- Dark mode

---

*Group Delta — BIUST COMP 302 | 2026*