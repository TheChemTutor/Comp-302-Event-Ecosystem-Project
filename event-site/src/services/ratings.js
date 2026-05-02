import { ref, set, get } from 'firebase/database'
import { db } from './firebase'

export const submitRating = async (eventId, userId, rating) => {
  await set(ref(db, `ratings/${eventId}/${userId}`), {
    rating,
    createdAt: new Date().toISOString()
  })
}

export const getUserRating = async (eventId, userId) => {
  const snapshot = await get(ref(db, `ratings/${eventId}/${userId}`))
  if (snapshot.exists()) return snapshot.val().rating
  return null
}

export const getEventRatings = async (eventId) => {
  const snapshot = await get(ref(db, `ratings/${eventId}`))
  if (!snapshot.exists()) return { average: 0, count: 0 }

  const ratings = Object.values(snapshot.val()).map(r => r.rating)
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length
  }
}