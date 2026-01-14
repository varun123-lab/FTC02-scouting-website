// Firebase Configuration
// To set up Firebase:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing one)
// 3. Click "Add app" and select Web (</>)
// 4. Register the app and copy the config below
// 5. Enable Authentication > Sign-in method > Email/Password
// 6. Create Firestore Database in production mode
// 7. Update Firestore Rules (see FIREBASE_RULES.md)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace these values with your Firebase project config
// Get this from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
