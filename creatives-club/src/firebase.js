import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYENPjCt2FTMmuXHQ5sTDjX7EzNtZpBBo",
  authDomain: "creatives-club-dev.firebaseapp.com",
  projectId: "creatives-club-dev",
  storageBucket: "creatives-club-dev.firebasestorage.app",
  messagingSenderId: "349072718471",
  appId: "1:349072718471:web:46aa90f9c60d8a5d2dd622"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);