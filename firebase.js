import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3k9Homa5ymw_Z0IK-WqVIiSPzAUpN7OQ",
  authDomain: "event-system-10101.firebaseapp.com",
  projectId: "event-system-10101"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
