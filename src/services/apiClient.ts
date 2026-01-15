import * as firebaseService from './firebaseService';
import { ScoutingEntry } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

const isApiMode = !!API_BASE;

async function request(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API error ${res.status}: ${txt}`);
  }
  return res.json();
}

// Authentication wrappers
export const firebaseSignUp = async (email: string, password: string, username: string) => {
  if (!isApiMode) return firebaseService.firebaseSignUp(email, password, username);
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
};

export const firebaseSignIn = async (email: string, password: string) => {
  if (!isApiMode) return firebaseService.firebaseSignIn(email, password);
  return request('/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
};

export const firebaseSignOut = async () => {
  if (!isApiMode) return firebaseService.firebaseSignOut();
  await request('/auth/signout', { method: 'POST' });
};

export const onAuthChange = (cb: any) => {
  if (!isApiMode) return firebaseService.onAuthChange(cb);
  // In API mode, auth is assumed to be token-based; we don't have realtime auth state.
  // Call callback once with null (no client-side session tracking).
  cb(null);
  return () => {};
};

export const getCurrentFirebaseUser = () => {
  if (!isApiMode) return firebaseService.getCurrentFirebaseUser();
  return null;
};

export const getFirebaseUserData = async (uid: string) => {
  if (!isApiMode) return firebaseService.getFirebaseUserData(uid);
  return request(`/users/${encodeURIComponent(uid)}`);
};

// Scouting entries
export const addScoutingEntry = async (entry: Omit<ScoutingEntry, 'id'>) => {
  if (!isApiMode) return firebaseService.addScoutingEntry(entry as any);
  const res = await request('/entries', { method: 'POST', body: JSON.stringify(entry) });
  return res.id;
};

export const getAllScoutingEntries = async (): Promise<ScoutingEntry[]> => {
  if (!isApiMode) return firebaseService.getAllScoutingEntries();
  return request('/entries');
};

export const getUserScoutingEntries = async (userId: string): Promise<ScoutingEntry[]> => {
  if (!isApiMode) return firebaseService.getUserScoutingEntries(userId);
  return request(`/entries?userId=${encodeURIComponent(userId)}`);
};

export const getScoutingEntryById = async (id: string): Promise<ScoutingEntry | null> => {
  if (!isApiMode) return firebaseService.getScoutingEntryById(id);
  return request(`/entries/${encodeURIComponent(id)}`);
};

export const updateScoutingEntryFirebase = async (id: string, data: Partial<ScoutingEntry>) => {
  if (!isApiMode) return firebaseService.updateScoutingEntryFirebase(id, data as any);
  await request(`/entries/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteScoutingEntryFirebase = async (id: string) => {
  if (!isApiMode) return firebaseService.deleteScoutingEntryFirebase(id);
  await request(`/entries/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

// Subscriptions: in API mode we emulate with polling; return unsubscribe function
export const subscribeToAllEntries = (callback: (entries: ScoutingEntry[]) => void) => {
  if (!isApiMode) return firebaseService.subscribeToAllEntries(callback as any);
  let active = true;
  const poll = async () => {
    try {
      const data = await getAllScoutingEntries();
      if (active) callback(data as any);
    } catch (e) {
      // ignore polling errors
    }
  };
  const id = setInterval(poll, 5000);
  // initial fetch
  poll();
  return () => { active = false; clearInterval(id); };
};

export const subscribeToUserEntries = (userId: string, callback: (entries: ScoutingEntry[]) => void) => {
  if (!isApiMode) return firebaseService.subscribeToUserEntries(userId, callback as any);
  let active = true;
  const poll = async () => {
    try {
      const data = await getUserScoutingEntries(userId);
      if (active) callback(data as any);
    } catch (e) {
      // ignore
    }
  };
  const id = setInterval(poll, 5000);
  poll();
  return () => { active = false; clearInterval(id); };
};

export const isFirebaseConfigured = firebaseService.isFirebaseConfigured;

export default {
  firebaseSignUp,
  firebaseSignIn,
  firebaseSignOut,
  onAuthChange,
  getCurrentFirebaseUser,
  getFirebaseUserData,
  addScoutingEntry,
  getAllScoutingEntries,
  getUserScoutingEntries,
  getScoutingEntryById,
  updateScoutingEntryFirebase,
  deleteScoutingEntryFirebase,
  subscribeToAllEntries,
  subscribeToUserEntries,
  isFirebaseConfigured,
  isApiMode,
};
