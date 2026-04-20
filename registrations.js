import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

// Register for event (MOBILE)
export async function registerForEvent(userId, eventId) {
  try {
    // Check if already registered
    const regRef = collection(db, "registrations");
    const q = query(regRef, where("userId", "==", userId), where("eventId", "==", eventId));
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      return { success: false, error: "Already registered" };
    }
    
    const registration = {
      userId,
      eventId,
      status: "registered",
      registeredAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "registrations"), registration);
    return { success: true, registrationId: docRef.id };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get user's registered events (MOBILE)
export async function getUserEvents(userId) {
  try {
    const regRef = collection(db, "registrations");
    const q = query(regRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    const registrations = [];
    for (const regDoc of snapshot.docs) {
      const reg = regDoc.data();
      const eventRef = doc(db, "events", reg.eventId);
      const eventSnap = await getDoc(eventRef);
      
      if (eventSnap.exists()) {
        registrations.push({
          registrationId: regDoc.id,
          event: { id: reg.eventId, ...eventSnap.data() },
          status: reg.status,
          registeredAt: reg.registeredAt
        });
      }
    }
    
    return { success: true, registrations };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Cancel registration
export async function cancelRegistration(registrationId) {
  try {
    await deleteDoc(doc(db, "registrations", registrationId));
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
