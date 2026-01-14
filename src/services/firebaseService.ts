// Firebase Storage Service - Cloud sync for scouting data
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from '../config/firebase';
import { ScoutingEntry } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  SCOUTING_ENTRIES: 'scoutingEntries',
};

// ============ Authentication ============

export const firebaseSignUp = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Store additional user data in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    username,
    email,
    createdAt: Timestamp.now(),
  });
  
  return {
    id: user.uid,
    username,
    email,
  };
};

export const firebaseSignIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Get username from Firestore
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
  const userData = userDoc.data();
  
  return {
    id: user.uid,
    username: userData?.username || email.split('@')[0],
    email: user.email,
  };
};

export const firebaseSignOut = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};

export const getFirebaseUserData = async (uid: string): Promise<{ id: string; username: string; createdAt: any } | null> => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: uid,
      username: data.username || 'User',
      createdAt: data.createdAt,
    };
  }
  return null;
};

// ============ Scouting Entries ============

export const addScoutingEntry = async (entry: Omit<ScoutingEntry, 'id'>) => {
  const docRef = await addDoc(collection(db, COLLECTIONS.SCOUTING_ENTRIES), {
    ...entry,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
};

export const getAllScoutingEntries = async (): Promise<ScoutingEntry[]> => {
  const q = query(
    collection(db, COLLECTIONS.SCOUTING_ENTRIES),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
  })) as ScoutingEntry[];
};

export const getUserScoutingEntries = async (userId: string): Promise<ScoutingEntry[]> => {
  const q = query(
    collection(db, COLLECTIONS.SCOUTING_ENTRIES),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
  })) as ScoutingEntry[];
};

export const getScoutingEntryById = async (id: string): Promise<ScoutingEntry | null> => {
  const docRef = doc(db, COLLECTIONS.SCOUTING_ENTRIES, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp?.toDate?.()?.toISOString() || docSnap.data().timestamp,
    } as ScoutingEntry;
  }
  return null;
};

export const updateScoutingEntryFirebase = async (id: string, data: Partial<ScoutingEntry>) => {
  const docRef = doc(db, COLLECTIONS.SCOUTING_ENTRIES, id);
  await updateDoc(docRef, data);
};

export const deleteScoutingEntryFirebase = async (id: string) => {
  const docRef = doc(db, COLLECTIONS.SCOUTING_ENTRIES, id);
  await deleteDoc(docRef);
};

// Real-time listener for all entries
export const subscribeToAllEntries = (callback: (entries: ScoutingEntry[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.SCOUTING_ENTRIES),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
    })) as ScoutingEntry[];
    callback(entries);
  });
};

// Real-time listener for user's entries
export const subscribeToUserEntries = (userId: string, callback: (entries: ScoutingEntry[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.SCOUTING_ENTRIES),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().timestamp,
    })) as ScoutingEntry[];
    callback(entries);
  });
};

// Export for checking if Firebase is configured
export { isFirebaseConfigured };
