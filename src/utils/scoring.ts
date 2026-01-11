// ======================================================
// FTC DECODE 2025–2026 — Official Scoring Utilities
// Based on Competition Manual Table 10-2 (Point Values)
// ======================================================

export interface ScoreCalculation {
  autoScore: number;
  teleopScore: number;
  endgameScore: number; // In DECODE, "endgame" is essentially BASE return scoring
  totalScore: number;
}

export const SCORING = {
  AUTO: {
    LEAVE_PER_ROBOT: 3,
    ARTIFACT_CLASSIFIED: 3,
    ARTIFACT_OVERFLOW: 1,
    PATTERN_MATCH: 2,
  },
  TELEOP: {
    ARTIFACT_CLASSIFIED: 3,
    ARTIFACT_OVERFLOW: 1,
    DEPOT_ARTIFACT: 1,
    PATTERN_MATCH: 2,
  },
  ENDGAME: {
    BASE_PARTIAL: 5,
    BASE_FULL: 10,
    TWO_ROBOTS_FULL_BONUS: 10,
  },
} as const;

// Suggested entry shape (what your scouting form should store)
export type DecodeEntry = {
  auto?: {
    leaveRobots?: number; // 0-2 robots
    classifiedArtifacts?: number;
    overflowArtifacts?: number;
    patternMatches?: number; // 0-9 indexes matching MOTIF
  };
  teleop?: {
    classifiedArtifacts?: number;
    overflowArtifacts?: number;
    depotArtifacts?: number; // artifacts over your depot at end
    patternMatches?: number; // 0-9 indexes matching MOTIF at end
  };
  endgame?: {
    baseFullRobots?: number; // 0-2 robots fully returned
    basePartialRobots?: number; // 0-2 robots partially returned
  };
};

export const calculateScores = (entry: DecodeEntry): ScoreCalculation => {
  const auto = entry.auto ?? {};
  const teleop = entry.teleop ?? {};
  const end = entry.endgame ?? {};

  // --------------------
  // AUTO
  // --------------------
  const autoScore =
    (auto.leaveRobots ?? 0) * SCORING.AUTO.LEAVE_PER_ROBOT +
    (auto.classifiedArtifacts ?? 0) * SCORING.AUTO.ARTIFACT_CLASSIFIED +
    (auto.overflowArtifacts ?? 0) * SCORING.AUTO.ARTIFACT_OVERFLOW +
    (auto.patternMatches ?? 0) * SCORING.AUTO.PATTERN_MATCH;

  // --------------------
  // TELEOP
  // --------------------
  const teleopScore =
    (teleop.classifiedArtifacts ?? 0) * SCORING.TELEOP.ARTIFACT_CLASSIFIED +
    (teleop.overflowArtifacts ?? 0) * SCORING.TELEOP.ARTIFACT_OVERFLOW +
    (teleop.depotArtifacts ?? 0) * SCORING.TELEOP.DEPOT_ARTIFACT +
    (teleop.patternMatches ?? 0) * SCORING.TELEOP.PATTERN_MATCH;

  // --------------------
  // ENDGAME / BASE RETURN
  // (If a robot is FULLY returned, don't also count it as PARTIAL.)
  // --------------------
  const full = Math.min(end.baseFullRobots ?? 0, 2);
  const partial = Math.min(end.basePartialRobots ?? 0, 2 - full);

  let endgameScore =
    full * SCORING.ENDGAME.BASE_FULL +
    partial * SCORING.ENDGAME.BASE_PARTIAL;

  if (full === 2) {
    endgameScore += SCORING.ENDGAME.TWO_ROBOTS_FULL_BONUS;
  }

  const totalScore = autoScore + teleopScore + endgameScore;

  return { autoScore, teleopScore, endgameScore, totalScore };
};

// Calculate team statistics from multiple entries
export const calculateTeamStats = (entries: any[]) => {
  if (entries.length === 0) {
    return {
      matchesScout: 0,
      avgAutoScore: 0,
      avgTeleopScore: 0,
      avgEndgameScore: 0,
      avgTotalScore: 0,
      avgDefenseRating: 0,
      avgSpeedRating: 0,
    };
  }

  const sum = entries.reduce(
    (acc, entry) => ({
      autoScore: acc.autoScore + entry.scores.autoScore,
      teleopScore: acc.teleopScore + entry.scores.teleopScore,
      endgameScore: acc.endgameScore + entry.scores.endgameScore,
      totalScore: acc.totalScore + entry.scores.totalScore,
      defenseRating: acc.defenseRating + entry.defenseRating,
      speedRating: acc.speedRating + entry.speedRating,
    }),
    {
      autoScore: 0,
      teleopScore: 0,
      endgameScore: 0,
      totalScore: 0,
      defenseRating: 0,
      speedRating: 0,
    }
  );

  const count = entries.length;

  return {
    matchesScout: count,
    avgAutoScore: Math.round(sum.autoScore / count),
    avgTeleopScore: Math.round(sum.teleopScore / count),
    avgEndgameScore: Math.round(sum.endgameScore / count),
    avgTotalScore: Math.round(sum.totalScore / count),
    avgDefenseRating: Math.round((sum.defenseRating / count) * 10) / 10,
    avgSpeedRating: Math.round((sum.speedRating / count) * 10) / 10,
  };
};
