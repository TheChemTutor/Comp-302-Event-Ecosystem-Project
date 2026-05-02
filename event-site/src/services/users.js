import { ref, get, update } from 'firebase/database'
import { db } from './firebase'

export const getUserById = async (userId) => {
  const snapshot = await get(ref(db, 'users/' + userId))
  if (snapshot.exists()) {
    return { id: userId, ...snapshot.val() }
  }
  return null
}

export const updateUser = async (userId, data) => {
  await update(ref(db, 'users/' + userId), data)
}

export const getUsersByIds = async (userIds) => {
  const promises = userIds.map(id => getUserById(id))
  const results = await Promise.all(promises)
  return results.filter(Boolean)
}
