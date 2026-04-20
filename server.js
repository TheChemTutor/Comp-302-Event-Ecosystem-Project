import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ============ AUTHENTICATION ============
app.post("/api/register", async (req, res) => {
  const { email, password, name, role = "attendee" } = req.body;
  
  try {
    // Check if user exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return res.json({ success: false, error: "User already exists" });
    }
    
    // Create user
    const userData = {
      email,
      password: hashPassword(password),
      name,
      role,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "users"), userData);
    res.json({ success: true, userId: docRef.id, user: { email, name, role } });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.json({ success: false, error: "User not found" });
    }
    
    let user = null;
    querySnapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });
    
    if (user.password !== hashPassword(password)) {
      return res.json({ success: false, error: "Wrong password" });
    }
    
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ============ EVENTS ============
app.post("/api/events", async (req, res) => {
  const { title, location, capacity, hostId, description, date } = req.body;
  
  try {
    const event = {
      title,
      description: description || "",
      date: date || new Date().toISOString(),
      location,
      capacity: capacity || 100,
      hostId: hostId || "unknown",
      registeredCount: 0,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "events"), event);
    res.json({ success: true, eventId: docRef.id, event });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    res.json({ success: true, events });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ============ REGISTRATIONS ============
app.post("/api/register-event", async (req, res) => {
  const { userId, eventId } = req.body;
  
  try {
    // Check if already registered
    const regRef = collection(db, "registrations");
    const q = query(regRef, where("userId", "==", userId), where("eventId", "==", eventId));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      return res.json({ success: false, error: "Already registered" });
    }
    
    const registration = {
      userId,
      eventId,
      status: "registered",
      registeredAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "registrations"), registration);
    res.json({ success: true, registrationId: docRef.id });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.get("/api/user/:userId/events", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const regRef = collection(db, "registrations");
    const q = query(regRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const registrations = [];
    for (const regDoc of snapshot.docs) {
      const reg = regDoc.data();
      const eventRef = collection(db, "events");
      const eventQuery = query(eventRef, where("__name__", "==", reg.eventId));
      const eventSnap = await getDocs(eventQuery);
      
      if (!eventSnap.empty) {
        eventSnap.forEach((eventDoc) => {
          registrations.push({
            registrationId: regDoc.id,
            event: { id: eventDoc.id, ...eventDoc.data() },
            status: reg.status,
            registeredAt: reg.registeredAt
          });
        });
      }
    }
    
    res.json({ success: true, registrations });
    
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// ============ START SERVER ============
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  ════════════════════════════════════════
  🚀 EVENT BACKEND API IS RUNNING!
  ════════════════════════════════════════
  
  📍 Server: http://localhost:${PORT}
  
  📡 Available Endpoints:
  
  🔐 AUTH:
  POST   /api/register     - Create account
  POST   /api/login        - Login
  
  📅 EVENTS:
  POST   /api/events       - Create event
  GET    /api/events       - Get all events
  
  🎟️ REGISTRATIONS:
  POST   /api/register-event        - Register for event
  GET    /api/user/:userId/events   - Get my events
  
  Press Ctrl+C to stop
  ════════════════════════════════════════
  `);
});
