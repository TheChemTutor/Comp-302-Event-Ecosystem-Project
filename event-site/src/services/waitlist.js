import { ref, set, get, remove } from 'firebase/database'
import { db } from './firebase'
import { createNotification } from './notifications'

export const joinWaitlist = async (eventId, userId) => {
  await set(ref(db, `waitlist/${eventId}/${userId}`), {
    joinedAt: new Date().toISOString(),
    status: 'waiting'
  })

  await createNotification(userId, {
    type: 'waitlist',
    title: 'Added to waitlist',
    body: 'You\'ll be notified the moment a spot opens up.',
    eventId,
  })
}

export const leaveWaitlist = async (eventId, userId) => {
  await remove(ref(db, `waitlist/${eventId}/${userId}`))
}

export const getWaitlistByEvent = async (eventId) => {
  const snapshot = await get(ref(db, `waitlist/${eventId}`))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([userId, data]) => ({
      userId,
      ...data
    }))
  }
  return []
}

export const getUserWaitlist = async (userId) => {
  const snapshot = await get(ref(db, 'waitlist'))
  if (!snapshot.exists()) return []

  const results = []
  snapshot.forEach((eventSnap) => {
    const eventId = eventSnap.key
    eventSnap.forEach((userSnap) => {
      if (userSnap.key === userId) {
        results.push({
          eventId,
          ...userSnap.val()
        })
      }
    })
  })
  return results
}

export const getWaitlistPosition = async (eventId, userId) => {
  const waitlist = await getWaitlistByEvent(eventId)
  const sorted = waitlist.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
  const position = sorted.findIndex(entry => entry.userId === userId)
  return {
    position: position + 1,
    total: sorted.length
  }
}