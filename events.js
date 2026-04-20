import { db } from "./firebase.js";
import { collection, addDoc, getDocs, getDoc, doc, query, where } from "firebase/firestore";

// Create event (WEB only)
export async function createEvent(eventData) {
  try {
    const event = {
      title: eventData.title,
      description: eventData.description || "",
      date: eventData.date || new Date().toISOString(),
      location: eventData.location,
      capacity: eventData.capacity || 100,
      hostId: eventData.hostId,
      registeredCount: 0,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "events"), event);
    return { success: true, eventId: docRef.id, event };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get all events (MOBILE)
export async function getAllEvents() {
  try {
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, events };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get single event by ID
export async function getEventById(eventId) {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return { success: false, error: "Event not found" };
    }
    
    return { success: true, event: { id: eventSnap.id, ...eventSnap.data() } };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
