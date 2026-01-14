// Type definitions for FTC DECODE 2025-2026 Scouting data structures
// Based on Competition Manual Table 10-2 (Point Values)

export interface User {
  id: string;
  username: string;
  password?: string; // Optional - not used with Firebase auth
  createdAt: string;
}

export interface AutoPath {
  id: string;
  paths: PathPoint[][];
  fieldImage?: string;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface ScoutingEntry {
  id: string;
  userId: string;
  username: string;
  teamNumber: string;
  matchNumber: string;
  alliance: 'red' | 'blue';
  timestamp: string;
  
  // Autonomous Phase (FTC DECODE 2025-2026)
  auto: {
    startPosition: 'blue-classifier' | 'blue-launch' | 'red-classifier' | 'red-launch';
    // Robot Leave (3 pts per robot that leaves starting area)
    leaveRobots: number; // 0-2 robots
    // Artifacts Classified (3 pts each - placed in correct zone)
    classifiedArtifacts: number;
    // Artifacts Overflow (1 pt each - placed in overflow)
    overflowArtifacts: number;
    // Pattern Matches (2 pts per matching index with MOTIF)
    patternMatches: number; // 0-9 indexes matching
    // Auto path tracking
    autoPath?: AutoPath;
    pathNotes?: string;
  };
  
  // Tele-Op Phase (FTC DECODE 2025-2026)
  teleop: {
    // Artifacts Classified (3 pts each)
    classifiedArtifacts: number;
    // Artifacts Overflow (1 pt each)
    overflowArtifacts: number;
    // Depot Artifacts (1 pt each - artifacts over your depot at end)
    depotArtifacts: number;
    // Pattern Matches (2 pts per matching index)
    patternMatches: number; // 0-9 indexes matching
    // Cycle tracking (for efficiency analysis)
    cyclesCompleted: number;
  };
  
  // Endgame / Base Return (FTC DECODE 2025-2026)
  endgame: {
    // Base Partial (5 pts) - robot partially in base
    basePartialRobots: number; // 0-2 robots
    // Base Full (10 pts) - robot fully in base
    baseFullRobots: number; // 0-2 robots
    // Two Robots Full Bonus (+10 pts if both robots fully returned)
  };
  
  // Calculated scores
  scores: {
    autoScore: number;
    teleopScore: number;
    endgameScore: number;
    totalScore: number;
  };
  
  // Additional notes
  notes: string;
  defenseRating: number; // 1-5 scale
  speedRating: number; // 1-5 scale
  driverSkill: number; // 1-5 scale
  reliability: number; // 1-5 scale
}

export interface DashboardFilter {
  user?: string;
  teamNumber?: string;
  matchNumber?: string;
  alliance?: 'red' | 'blue' | 'all';
  sortBy: 'timestamp' | 'teamNumber' | 'matchNumber' | 'totalScore';
  sortOrder: 'asc' | 'desc';
}

export interface TeamStatistics {
  teamNumber: string;
  matchesScout: number;
  avgAutoScore: number;
  avgTeleopScore: number;
  avgEndgameScore: number;
  avgTotalScore: number;
  avgDefenseRating: number;
  avgSpeedRating: number;
}

export interface UserStatistics {
  username: string;
  totalEntries: number;
  teamsScout: string[];
  avgScoresRecorded: number;
}
