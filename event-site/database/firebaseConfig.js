import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyAtfyo0aAE8b8wTq5MotpqsFFW7eyDKkuI",
  authDomain: "event-horizon-b55ea.firebaseapp.com",
  databaseURL: "https://event-horizon-b55ea-default-rtdb.firebaseio.com",
  projectId: "event-horizon-b55ea",
  storageBucket: "event-horizon-b55ea.firebasestorage.app",
  messagingSenderId: "844114035628",
  appId: "1:844114035628:web:68254c271fbfcf8f02f009",
  measurementId: "G-F8HBL4B126"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)