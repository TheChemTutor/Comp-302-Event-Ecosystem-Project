import { ref, set, get, push, update } from 'firebase/database'
import { db } from './firebase'

export const createNotification = async (userId, data) => {
  const newRef = push(ref(db, `notifications/${userId}`))
  await set(newRef, {
    ...data,
    read: false,
    createdAt: new Date().toISOString(),
  })
  return newRef.key
}

export const getUserNotifications = async (userId) => {
  const snapshot = await get(ref(db, `notifications/${userId}`))
  if (snapshot.exists()) {
    return Object.entries(snapshot.val())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return []
}

export const markAsRead = async (userId, notificationId) => {
  await update(ref(db, `notifications/${userId}/${notificationId}`), {
    read: true
  })
}

export const markAllAsRead = async (userId) => {
  const snapshot = await get(ref(db, `notifications/${userId}`))
  if (!snapshot.exists()) return

  const updates = {}
  Object.keys(snapshot.val()).forEach(id => {
    updates[`notifications/${userId}/${id}/read`] = true
  })
  await update(ref(db), updates)
}