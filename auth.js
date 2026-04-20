import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import crypto from "crypto";

// Hash password (simple for now)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Register new user
export async function registerUser(email, password, name, role = "attendee") {
  try {
    // Check if user exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, error: "User already exists" };
    }
    
    // Create user
    const userData = {
      email,
      password: hashPassword(password),
      name,
      role,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "users"), userData);
    return { success: true, userId: docRef.id, user: { email, name, role } };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: "User not found" };
    }
    
    let user = null;
    querySnapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });
    
    if (user.password !== hashPassword(password)) {
      return { success: false, error: "Wrong password" };
    }
    
    return { 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
