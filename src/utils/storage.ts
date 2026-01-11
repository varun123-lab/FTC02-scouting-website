// Local Storage utility functions
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

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

// Format start position to readable text
const formatStartPosition = (pos: string): string => {
  const positions: Record<string, string> = {
    'blue-classifier': 'Blue Against Classifier',
    'blue-launch': 'Blue Launch Zone',
    'red-classifier': 'Red Against Classifier',
    'red-launch': 'Red Launch Zone',
  };
  return positions[pos] || pos || 'Not Set';
};

// Format entry to human-readable format
const formatEntryForExport = (entry: any) => ({
  'Team Number': entry.teamNumber,
  'Match Number': entry.matchNumber,
  'Alliance': entry.alliance === 'red' ? 'Red Alliance' : 'Blue Alliance',
  'Scouted By': entry.username,
  'Date': new Date(entry.timestamp).toLocaleDateString(),
  'Time': new Date(entry.timestamp).toLocaleTimeString(),
  
  'AUTONOMOUS': '---',
  'Starting Position': formatStartPosition(entry.auto?.startPosition),
  'Leave Robots': entry.auto?.leaveRobots || 0,
  'Classified Artifacts (Auto)': entry.auto?.classifiedArtifacts || 0,
  'Overflow Artifacts (Auto)': entry.auto?.overflowArtifacts || 0,
  'Pattern Matches (Auto)': entry.auto?.patternMatches || 0,
  'Auto Path Drawn': entry.auto?.autoPath ? 'Yes' : 'No',
  'Auto Path Notes': entry.auto?.pathNotes || 'No notes',
  'Auto Score': entry.scores?.autoScore || 0,
  
  'TELE-OP': '---',
  'Classified Artifacts (Tele-Op)': entry.teleop?.classifiedArtifacts || 0,
  'Overflow Artifacts (Tele-Op)': entry.teleop?.overflowArtifacts || 0,
  'Depot Artifacts': entry.teleop?.depotArtifacts || 0,
  'Pattern Matches (Tele-Op)': entry.teleop?.patternMatches || 0,
  'Cycles Completed': entry.teleop?.cyclesCompleted || 0,
  'Tele-Op Score': entry.scores?.teleopScore || 0,
  
  'ENDGAME': '---',
  'Base Partial Returns': entry.endgame?.basePartialRobots || 0,
  'Base Full Returns': entry.endgame?.baseFullRobots || 0,
  'Endgame Score': entry.scores?.endgameScore || 0,
  
  'TOTAL SCORE': entry.scores?.totalScore || 0,
  
  'RATINGS': '---',
  'Defense Rating': `${entry.defenseRating || 0} / 5`,
  'Speed Rating': `${entry.speedRating || 0} / 5`,
  'Driver Skill': `${entry.driverSkill || 0} / 5`,
  'Reliability': `${entry.reliability || 0} / 5`,
  
  'Notes': entry.notes || 'No notes',
});

// Export data as JSON
export const exportDataAsJSON = (): void => {
  const entries = getScoutingEntries();
  const formattedEntries = entries.map(formatEntryForExport);
  const dataStr = JSON.stringify(formattedEntries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FTC Scouting Data - ${new Date().toLocaleDateString()}.json`;
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
    'Auto Path Drawn',
    'Auto Path Notes',
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
    entry.alliance === 'red' ? 'Red Alliance' : 'Blue Alliance',
    formatStartPosition(entry.auto?.startPosition || ''),
    entry.auto?.leaveRobots || 0,
    entry.auto?.classifiedArtifacts || 0,
    entry.auto?.overflowArtifacts || 0,
    entry.auto?.patternMatches || 0,
    entry.auto?.autoPath ? 'Yes' : 'No',
    `"${(entry.auto?.pathNotes || 'No notes').replace(/"/g, '""')}"`,
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
  link.download = `FTC Scouting Data - ${new Date().toLocaleDateString()}.csv`;
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
  const formattedEntries = entries.map(formatEntryForExport);
  const dataStr = JSON.stringify(formattedEntries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${username}'s Scouting Data - ${new Date().toLocaleDateString()}.json`;
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
    'Auto Path Drawn',
    'Auto Path Notes',
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
    entry.alliance === 'red' ? 'Red Alliance' : 'Blue Alliance',
    formatStartPosition(entry.auto?.startPosition || ''),
    entry.auto?.leaveRobots || 0,
    entry.auto?.classifiedArtifacts || 0,
    entry.auto?.overflowArtifacts || 0,
    entry.auto?.patternMatches || 0,
    entry.auto?.autoPath ? 'Yes' : 'No',
    `"${(entry.auto?.pathNotes || 'No notes').replace(/"/g, '""')}"`,
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
    `${entry.defenseRating || 0}/5`,
    `${entry.speedRating || 0}/5`,
    `${entry.driverSkill || 0}/5`,
    `${entry.reliability || 0}/5`,
    `"${(entry.notes || 'No notes').replace(/"/g, '""')}"`,
    new Date(entry.timestamp).toLocaleString()
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${username}'s Scouting Data - ${new Date().toLocaleDateString()}.csv`;
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

// Helper function to create an entry document section
const createEntrySection = (entry: any, index: number) => {
  const sections: Paragraph[] = [];
  
  // Entry header
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Entry #${index + 1}: Team ${entry.teamNumber} - Match ${entry.matchNumber}`,
          bold: true,
          size: 28,
        }),
      ],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Basic info
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Alliance: ', bold: true }),
        new TextRun({ text: entry.alliance === 'red' ? 'Red Alliance' : 'Blue Alliance' }),
        new TextRun({ text: '  |  ' }),
        new TextRun({ text: 'Scouted By: ', bold: true }),
        new TextRun({ text: entry.username || 'Unknown' }),
        new TextRun({ text: '  |  ' }),
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun({ text: new Date(entry.timestamp).toLocaleString() }),
      ],
      spacing: { after: 200 },
    })
  );

  // Score summary
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📊 SCORES: ', bold: true, size: 24 }),
        new TextRun({ text: `Auto: ${entry.scores?.autoScore || 0}`, size: 24 }),
        new TextRun({ text: '  |  ' }),
        new TextRun({ text: `Tele-Op: ${entry.scores?.teleopScore || 0}`, size: 24 }),
        new TextRun({ text: '  |  ' }),
        new TextRun({ text: `Endgame: ${entry.scores?.endgameScore || 0}`, size: 24 }),
        new TextRun({ text: '  |  ' }),
        new TextRun({ text: `TOTAL: ${entry.scores?.totalScore || 0}`, bold: true, size: 24 }),
      ],
      spacing: { after: 200 },
    })
  );

  // Autonomous Phase
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '🤖 AUTONOMOUS PHASE', bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Starting Position: ${formatStartPosition(entry.auto?.startPosition)}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Leave Robots: ${entry.auto?.leaveRobots || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Classified Artifacts: ${entry.auto?.classifiedArtifacts || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Overflow Artifacts: ${entry.auto?.overflowArtifacts || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Pattern Matches (MOTIF): ${entry.auto?.patternMatches || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Auto Path Drawn: ${entry.auto?.autoPath ? 'Yes' : 'No'}` }),
      ],
    })
  );
  if (entry.auto?.pathNotes) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• Path Notes: ${entry.auto.pathNotes}` }),
        ],
      })
    );
  }

  // Tele-Op Phase
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '🎮 TELE-OP PHASE', bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Classified Artifacts: ${entry.teleop?.classifiedArtifacts || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Overflow Artifacts: ${entry.teleop?.overflowArtifacts || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Depot Artifacts: ${entry.teleop?.depotArtifacts || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Pattern Matches (MOTIF): ${entry.teleop?.patternMatches || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Cycles Completed: ${entry.teleop?.cyclesCompleted || 0}` }),
      ],
    })
  );

  // Endgame Phase
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '🏁 ENDGAME PHASE', bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Base Partial Returns: ${entry.endgame?.basePartialRobots || 0}` }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Base Full Returns: ${entry.endgame?.baseFullRobots || 0}` }),
      ],
    })
  );

  // Ratings
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '⭐ RATINGS', bold: true, size: 24 })],
      spacing: { before: 200, after: 100 },
    })
  );
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: `• Defense: ${entry.defenseRating || 0}/5  |  Speed: ${entry.speedRating || 0}/5  |  Driver Skill: ${entry.driverSkill || 0}/5  |  Reliability: ${entry.reliability || 0}/5` }),
      ],
    })
  );

  // Notes
  if (entry.notes) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: '📝 NOTES', bold: true, size: 24 })],
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: entry.notes })],
      })
    );
  }

  // Divider line
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: '─'.repeat(60) })],
      spacing: { before: 300, after: 300 },
    })
  );

  return sections;
};

// Export all data as Word document
export const exportDataAsWord = async (): Promise<void> => {
  const entries = getScoutingEntries();
  if (entries.length === 0) {
    alert('No data to export');
    return;
  }

  const allSections: Paragraph[] = [];

  // Title
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'FTC DECODE 2025-2026 Scouting Report',
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  // Subtitle with date
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          size: 24,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Summary stats
  const uniqueTeams = new Set(entries.map(e => e.teamNumber)).size;
  const avgScore = Math.round(entries.reduce((sum, e) => sum + (e.scores?.totalScore || 0), 0) / entries.length);
  
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📊 SUMMARY: ', bold: true, size: 28 }),
        new TextRun({ text: `${entries.length} Entries  |  ${uniqueTeams} Teams  |  Avg Score: ${avgScore}`, size: 28 }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  // Add all entries
  entries.forEach((entry, index) => {
    allSections.push(...createEntrySection(entry, index));
  });

  const doc = new Document({
    sections: [
      {
        children: allSections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `FTC Scouting Report - ${new Date().toLocaleDateString()}.docx`);
};

// Export user-specific data as Word document
export const exportUserDataAsWord = async (userId: string, username: string): Promise<void> => {
  const entries = getEntriesByUser(userId);
  if (entries.length === 0) {
    alert('No data to export for this user');
    return;
  }

  const allSections: Paragraph[] = [];

  // Title
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${username}'s Scouting Report`,
          bold: true,
          size: 48,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );

  // Subtitle
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'FTC DECODE 2025-2026 Season',
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  allSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          size: 24,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Summary stats
  const uniqueTeams = new Set(entries.map(e => e.teamNumber)).size;
  const avgScore = Math.round(entries.reduce((sum, e) => sum + (e.scores?.totalScore || 0), 0) / entries.length);
  const highScore = Math.max(...entries.map(e => e.scores?.totalScore || 0));
  
  allSections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '📊 MY STATS: ', bold: true, size: 28 }),
        new TextRun({ text: `${entries.length} Entries  |  ${uniqueTeams} Teams  |  Avg: ${avgScore}  |  Best: ${highScore}`, size: 28 }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  // Add all entries
  entries.forEach((entry, index) => {
    allSections.push(...createEntrySection(entry, index));
  });

  const doc = new Document({
    sections: [
      {
        children: allSections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${username}'s Scouting Report - ${new Date().toLocaleDateString()}.docx`);
};
