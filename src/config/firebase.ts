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
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Replace these values with your Firebase project config
// Get this from Firebase Console > Project Settings > Your apps
// Prefer environment variables (Vite uses `import.meta.env.VITE_...`).
// If env vars are missing, fall back to the previously provided config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCFgzoZ94991pY3Dptgdqqd72duaYmqVYU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "scouting-app-dfe42.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "scouting-app-dfe42",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "scouting-app-dfe42.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "153121866612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:153121866612:web:2b98217a537cf502bd2221",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TML55NNH64",
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

// Initialize Analytics (safe in non-browser environments)
let analytics: Analytics | undefined;
try {
  // Analytics will only initialize in browser contexts where window is available
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
} catch (e) {
  analytics = undefined;
}

export { analytics };

export default app;
