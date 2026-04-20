import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyA3k9Homa5ymw_Z0IK-WqVIiSPzAUpN7OQ",
  authDomain: "event-system-10101.firebaseapp.com",
  databaseURL: "https://event-system-10101-default-rtdb.firebaseio.com",
  projectId: "event-system-10101",
  storageBucket: "event-system-10101.firebasestorage.app",
  messagingSenderId: "873418943503",
  appId: "1:873418943503:web:f87f47c8a2f6fe5351877a"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)