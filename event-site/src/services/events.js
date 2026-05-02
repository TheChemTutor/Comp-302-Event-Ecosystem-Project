import { ref, set, get, push, update, remove } from 'firebase/database'
import { db } from './firebase'
import { createNotification } from './notifications'
import { getTicketsByEvent } from './tickets'
import { getFollowedHosts } from './follows'


export const getAllEvents = async () => {
  const snapshot = await get(ref(db, 'events'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export const getEventById = async (eventId) => {
  const snapshot = await get(ref(db, 'events/' + eventId))
  if (snapshot.exists()) {
    return { id: eventId, ...snapshot.val() }
  }
  return null
}

export const getEventsByHost = async (hostId) => {
  const snapshot = await get(ref(db, 'events'))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .filter(([id, data]) => data.hostId === hostId)
      .map(([id, data]) => ({ id, ...data }))
  }
  return []
}

export const createEvent = async (eventData, user) => {
  const newEventRef = push(ref(db, 'events'))
  await set(newEventRef, {
    ...eventData,
    hostId: user.uid,
    hostName: user.displayName || 'Host',
    createdAt: new Date().toISOString(),
  })

  const followersSnap = await get(ref(db, 'follows'))
  if (followersSnap.exists()) {
    const notifications = []
    followersSnap.forEach(userSnap => {
      if (userSnap.child(user.uid).exists()) {
        notifications.push(
          createNotification(userSnap.key, {
            type: 'reminder',
            title: `New event from ${user.displayName || 'a host you follow'}`,
            body: `${eventData.title} has just been posted.`,
            eventId: newEventRef.key,
          })
        )
      }
    })
    await Promise.all(notifications)
  }

  return newEventRef.key
}

export const updateEvent = async (eventId, eventData) => {
  await update(ref(db, 'events/' + eventId), eventData)

  const tickets = await getTicketsByEvent(eventId)
  const uniqueUserIds = [...new Set(tickets.map(t => t.userId))]

  await Promise.all(
    uniqueUserIds.map(userId =>
      createNotification(userId, {
        type: 'reminder',
        title: 'Event updated',
        body: 'An event you have a ticket for has been updated. Check the details.',
        eventId,
      })
    )
  )
}

export const deleteEvent = async (eventId) => {
  const tickets = await getTicketsByEvent(eventId)
  const uniqueUserIds = [...new Set(tickets.map(t => t.userId))]

  await remove(ref(db, 'events/' + eventId))

  await Promise.all(
    uniqueUserIds.map(userId =>
      createNotification(userId, {
        type: 'reminder',
        title: 'Event cancelled',
        body: 'An event you had a ticket for has been cancelled.',
        eventId,
      })
    )
  )
}