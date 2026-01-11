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

// Export data as JSON
export const exportDataAsJSON = (): void => {
  const entries = getScoutingEntries();
  const dataStr = JSON.stringify(entries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ftc-scouting-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export data as CSV
export const exportDataAsCSV = (): void => {
  const entries = getScoutingEntries();
  if (entries.length === 0) {
    alert('No data to export');
    return;
  }

  // CSV headers
  const headers = [
    'Team Number',
    'Match Number',
    'Alliance',
    'Start Position',
    'Auto Leave Robots',
    'Auto Classified Artifacts',
    'Auto Overflow Artifacts',
    'Auto Pattern Matches',
    'Teleop Classified Artifacts',
    'Teleop Overflow Artifacts',
    'Teleop Depot Artifacts',
    'Teleop Pattern Matches',
    'Teleop Cycles',
    'Endgame Base Partial',
    'Endgame Base Full',
    'Auto Score',
    'Teleop Score',
    'Endgame Score',
    'Total Score',
    'Defense Rating',
    'Speed Rating',
    'Driver Skill',
    'Reliability',
    'Notes',
    'Scout',
    'Timestamp'
  ];

  // CSV rows
  const rows = entries.map(entry => [
    entry.teamNumber,
    entry.matchNumber,
    entry.alliance,
    entry.auto?.startPosition || '',
    entry.auto?.leaveRobots || 0,
    entry.auto?.classifiedArtifacts || 0,
    entry.auto?.overflowArtifacts || 0,
    entry.auto?.patternMatches || 0,
    entry.teleop?.classifiedArtifacts || 0,
    entry.teleop?.overflowArtifacts || 0,
    entry.teleop?.depotArtifacts || 0,
    entry.teleop?.patternMatches || 0,
    entry.teleop?.cyclesCompleted || 0,
    entry.endgame?.basePartialRobots || 0,
    entry.endgame?.baseFullRobots || 0,
    entry.scores?.autoScore || 0,
    entry.scores?.teleopScore || 0,
    entry.scores?.endgameScore || 0,
    entry.scores?.totalScore || 0,
    entry.defenseRating || 0,
    entry.speedRating || 0,
    entry.driverSkill || 0,
    entry.reliability || 0,
    `"${(entry.notes || '').replace(/"/g, '""')}"`,
    entry.username || '',
    entry.timestamp || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ftc-scouting-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import data from JSON
export const importDataFromJSON = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          const existingEntries = getScoutingEntries();
          const existingIds = new Set(existingEntries.map(e => e.id));
          const newEntries = data.filter(entry => !existingIds.has(entry.id));
          const allEntries = [...existingEntries, ...newEntries];
          localStorage.setItem(STORAGE_KEYS.SCOUTING_ENTRIES, JSON.stringify(allEntries));
          resolve(newEntries.length);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Export user-specific data as JSON
export const exportUserDataAsJSON = (userId: string, username: string): void => {
  const entries = getEntriesByUser(userId);
  if (entries.length === 0) {
    alert('No data to export for this user');
    return;
  }
  const dataStr = JSON.stringify(entries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ftc-scouting-${username}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export user-specific data as CSV
export const exportUserDataAsCSV = (userId: string, username: string): void => {
  const entries = getEntriesByUser(userId);
  if (entries.length === 0) {
    alert('No data to export for this user');
    return;
  }

  const headers = [
    'Team Number',
    'Match Number',
    'Alliance',
    'Start Position',
    'Auto Leave Robots',
    'Auto Classified Artifacts',
    'Auto Overflow Artifacts',
    'Auto Pattern Matches',
    'Teleop Classified Artifacts',
    'Teleop Overflow Artifacts',
    'Teleop Depot Artifacts',
    'Teleop Pattern Matches',
    'Teleop Cycles',
    'Endgame Base Partial',
    'Endgame Base Full',
    'Auto Score',
    'Teleop Score',
    'Endgame Score',
    'Total Score',
    'Defense Rating',
    'Speed Rating',
    'Driver Skill',
    'Reliability',
    'Notes',
    'Timestamp'
  ];

  const rows = entries.map(entry => [
    entry.teamNumber,
    entry.matchNumber,
    entry.alliance,
    entry.auto?.startPosition || '',
    entry.auto?.leaveRobots || 0,
    entry.auto?.classifiedArtifacts || 0,
    entry.auto?.overflowArtifacts || 0,
    entry.auto?.patternMatches || 0,
    entry.teleop?.classifiedArtifacts || 0,
    entry.teleop?.overflowArtifacts || 0,
    entry.teleop?.depotArtifacts || 0,
    entry.teleop?.patternMatches || 0,
    entry.teleop?.cyclesCompleted || 0,
    entry.endgame?.basePartialRobots || 0,
    entry.endgame?.baseFullRobots || 0,
    entry.scores?.autoScore || 0,
    entry.scores?.teleopScore || 0,
    entry.scores?.endgameScore || 0,
    entry.scores?.totalScore || 0,
    entry.defenseRating || 0,
    entry.speedRating || 0,
    entry.driverSkill || 0,
    entry.reliability || 0,
    `"${(entry.notes || '').replace(/"/g, '""')}"`,
    entry.timestamp || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ftc-scouting-${username}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Calculate user statistics
export const getUserStats = (userId: string) => {
  const entries = getEntriesByUser(userId);
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      uniqueTeams: 0,
      avgAutoScore: 0,
      avgTeleopScore: 0,
      avgEndgameScore: 0,
      avgTotalScore: 0,
      highestScore: 0,
      lowestScore: 0,
      avgDefenseRating: 0,
      avgSpeedRating: 0,
    };
  }

  const uniqueTeams = new Set(entries.map(e => e.teamNumber)).size;
  const totalAuto = entries.reduce((sum, e) => sum + (e.scores?.autoScore || 0), 0);
  const totalTeleop = entries.reduce((sum, e) => sum + (e.scores?.teleopScore || 0), 0);
  const totalEndgame = entries.reduce((sum, e) => sum + (e.scores?.endgameScore || 0), 0);
  const totalScore = entries.reduce((sum, e) => sum + (e.scores?.totalScore || 0), 0);
  const totalDefense = entries.reduce((sum, e) => sum + (e.defenseRating || 0), 0);
  const totalSpeed = entries.reduce((sum, e) => sum + (e.speedRating || 0), 0);
  const scores = entries.map(e => e.scores?.totalScore || 0);

  return {
    totalEntries: entries.length,
    uniqueTeams,
    avgAutoScore: Math.round((totalAuto / entries.length) * 10) / 10,
    avgTeleopScore: Math.round((totalTeleop / entries.length) * 10) / 10,
    avgEndgameScore: Math.round((totalEndgame / entries.length) * 10) / 10,
    avgTotalScore: Math.round((totalScore / entries.length) * 10) / 10,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    avgDefenseRating: Math.round((totalDefense / entries.length) * 10) / 10,
    avgSpeedRating: Math.round((totalSpeed / entries.length) * 10) / 10,
  };
};
