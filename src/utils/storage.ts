// Local Storage utility functions

const STORAGE_KEYS = {
  USERS: 'ftc_users',
  CURRENT_USER: 'ftc_current_user',
  SCOUTING_ENTRIES: 'ftc_scouting_entries',
  THEME: 'ftc_theme',
} as const;

// User operations
export const getUsers = (): any[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: any): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const findUser = (username: string): any | null => {
  const users = getUsers();
  return users.find(u => u.username === username) || null;
};

export const getCurrentUser = (): any | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: any | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Scouting entries operations
export const getScoutingEntries = (): any[] => {
  const entries = localStorage.getItem(STORAGE_KEYS.SCOUTING_ENTRIES);
  return entries ? JSON.parse(entries) : [];
};

export const saveScoutingEntry = (entry: any): void => {
  const entries = getScoutingEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEYS.SCOUTING_ENTRIES, JSON.stringify(entries));
};

export const updateScoutingEntry = (id: string, updatedEntry: any): void => {
  const entries = getScoutingEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    localStorage.setItem(STORAGE_KEYS.SCOUTING_ENTRIES, JSON.stringify(entries));
  }
};

export const deleteScoutingEntry = (id: string): void => {
  const entries = getScoutingEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.SCOUTING_ENTRIES, JSON.stringify(filtered));
};

export const getEntriesByUser = (userId: string): any[] => {
  return getScoutingEntries().filter(e => e.userId === userId);
};

// Theme operations
export const getTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return (theme as 'light' | 'dark') || 'light';
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// Clear all data (for development/testing)
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
