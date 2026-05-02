import { ref, set, get, remove } from 'firebase/database'
import { db } from './firebase'

export const followHost = async (userId, hostId) => {
  await set(ref(db, `follows/${userId}/${hostId}`), {
    followedAt: new Date().toISOString()
  })
}

export const unfollowHost = async (userId, hostId) => {
  await remove(ref(db, `follows/${userId}/${hostId}`))
}

export const isFollowing = async (userId, hostId) => {
  const snapshot = await get(ref(db, `follows/${userId}/${hostId}`))
  return snapshot.exists()
}

export const getFollowedHosts = async (userId) => {
  const snapshot = await get(ref(db, `follows/${userId}`))
  if (!snapshot.exists()) return []
  return Object.keys(snapshot.val())
}

export const getFollowerCount = async (hostId) => {
  const snapshot = await get(ref(db, `follows`))
  if (!snapshot.exists()) return 0
  let count = 0
  snapshot.forEach(userSnap => {
    if (userSnap.child(hostId).exists()) count++
  })
  return count
}