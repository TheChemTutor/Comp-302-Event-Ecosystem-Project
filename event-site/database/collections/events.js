import { ref, set, get, push } from 'firebase/database'
import { db } from '../firebaseConfig'

// Get all events
export const getAllEvents = async () => {
  const snapshot = await get(ref(db, 'events'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
  }
  return []
}

// Get one event by ID
export const getEventById = async (eventId) => {
  const snapshot = await get(ref(db, 'events/' + eventId))
  if (snapshot.exists()) {
    return { id: eventId, ...snapshot.val() }
  }
  return null
}

// Register for an event
export const registerForEvent = async (eventId, userId, ticketType, price) => {
  const newTicketRef = push(ref(db, 'tickets'))
  await set(newTicketRef, {
    eventId,
    userId,
    ticketType,
    price,
    purchasedAt: new Date().toISOString(),
    checkedIn: false,
    qrCode: newTicketRef.key
  })
  return newTicketRef.key
}

// Get tickets for a user
export const getUserTickets = async (userId) => {
  const snapshot = await get(ref(db, 'tickets'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([id, ticket]) => ticket.userId === userId)
      .map(([id, data]) => ({ id, ...data }))
  }
  return []
}

// Join waitlist
export const joinWaitlist = async (eventId, userId) => {
  await set(ref(db, `waitlist/${eventId}/${userId}`), {
    joinedAt: new Date().toISOString()
  })
}