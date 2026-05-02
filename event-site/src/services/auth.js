import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { auth, db } from './firebase'

export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const userCredential = await signInWithPopup(auth, provider)
  return userCredential.user
}

export const registerWithEmail = async (formData) => {
  const { fullName, email, password, dob, gender, phone } = formData
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  await updateProfile(user, { displayName: fullName })

  await set(ref(db, 'users/' + user.uid), {
    fullName,
    email,
    dob,
    gender,
    phone,
    createdAt: new Date().toISOString()
  })

  return user
}

export const logout = async () => {
  await signOut(auth)
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

export const getCurrentUser = () => {
  return auth.currentUser
}