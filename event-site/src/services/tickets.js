import { ref, set, get, push, remove } from 'firebase/database'
import { db } from './firebase'
import { createNotification } from './notifications'

export const registerForEvent = async (eventId, userId, ticketType, price, groupSize = 1) => {
  const eventSnap = await get(ref(db, 'events/' + eventId))
  if (eventSnap.exists()) {
    const event = eventSnap.val()

    if (event.capacity) {
      const ticketsSnap = await get(ref(db, 'tickets'))
      if (ticketsSnap.exists()) {
        const eventTickets = Object.values(ticketsSnap.val()).filter(t => t.eventId === eventId)

        // check capacity against total group sizes
        const totalAttendees = eventTickets.reduce((sum, t) => sum + (t.groupSize || 1), 0)
        if (totalAttendees + groupSize > Number(event.capacity)) {
          throw new Error('CAPACITY_REACHED')
        }

        // check max 10 tickets per user per event
        const userTicketCount = eventTickets.filter(t => t.userId === userId).length
        if (userTicketCount >= 10) {
          throw new Error('MAX_TICKETS_REACHED')
        }
      }
    }
  }

  const newTicketRef = push(ref(db, 'tickets'))
  await set(newTicketRef, {
    eventId,
    userId,
    ticketType,
    price,
    groupSize,
    purchasedAt: new Date().toISOString(),
    checkedIn: false,
    attendedCount: 0,
    qrCode: newTicketRef.key
  })

  await createNotification(userId, {
    type: 'ticket',
    title: 'Ticket confirmed',
    body: 'Your ticket is ready. Show the QR code at the entrance.',
    eventId,
  })

  const eventSnap2 = await get(ref(db, 'events/' + eventId))
  if (eventSnap2.exists()) {
    const event = eventSnap2.val()
    if (event.capacity && event.hostId) {
      const ticketsSnap2 = await get(ref(db, 'tickets'))
      if (ticketsSnap2.exists()) {
        const eventTickets = Object.values(ticketsSnap2.val()).filter(t => t.eventId === eventId)
        const totalAttendees = eventTickets.reduce((sum, t) => sum + (t.groupSize || 1), 0)
        const capacity = Number(event.capacity)
        const pct = Math.round((totalAttendees / capacity) * 100)

        if (totalAttendees === 1) {
          await createNotification(event.hostId, {
            type: 'host',
            title: 'First registration!',
            body: `Someone just registered for ${event.title}.`,
            eventId,
          })
        } else if (pct === 50) {
          await createNotification(event.hostId, {
            type: 'host',
            title: 'Halfway there!',
            body: `${event.title} is 50% sold out.`,
            eventId,
          })
        } else if (pct >= 90 && pct < 100) {
          await createNotification(event.hostId, {
            type: 'host',
            title: 'Almost full!',
            body: `${event.title} is 90% sold out.`,
            eventId,
          })
        } else if (totalAttendees >= capacity) {
          await createNotification(event.hostId, {
            type: 'host',
            title: 'Sold out!',
            body: `${event.title} is fully booked.`,
            eventId,
          })
        }
      }
    }
  }

  return newTicketRef.key
}
  
export const getUserTickets = async (userId) => {
  const snapshot = await get(ref(db, 'tickets'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([id, ticket]) => ticket.userId === userId)
      .map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export const getAllTickets = async () => {
  const snapshot = await get(ref(db, 'tickets'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export const getTicketsByEvent = async (eventId) => {
  const snapshot = await get(ref(db, 'tickets'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([id, ticket]) => ticket.eventId === eventId)
      .map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export const cancelTicket = async (ticketId) => {
  await remove(ref(db, 'tickets/' + ticketId))
}

export const checkInTicket = async (ticketId) => {
  const snapshot = await get(ref(db, 'tickets/' + ticketId))
  if (!snapshot.exists()) throw new Error('Ticket not found')
  const ticket = snapshot.val()
  const groupSize = ticket.groupSize || 1

  await update(ref(db, 'tickets/' + ticketId), {
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    attendedCount: groupSize
  })
}