import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Search, ChevronDown, ChevronUp, Trophy, Target, Zap, Shield, Award, Sparkles } from 'lucide-react';
import { getEntriesByUser } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { ScoutingEntry } from '../types';
import AIInsights from '../components/AIInsights';
import AITeamComparison from '../components/AITeamComparison';
import AIMatchPredictor from '../components/AIMatchPredictor';

interface TeamStats {
  teamNumber: string;
  matchCount: number;
  avgAutoScore: number;
  avgTeleopScore: number;
  avgEndgameScore: number;
  avgTotalScore: number;
  avgDefenseRating: number;
  avgSpeedRating: number;
  maxTotalScore: number;
  minTotalScore: number;
  // Detailed averages
  avgAutoLeaveRobots: number;
  avgAutoClassified: number;
  avgAutoOverflow: number;
  avgAutoPatternMatches: number;
  avgTeleopClassified: number;
  avgTeleopOverflow: number;
  avgTeleopDepot: number;
  avgTeleopPatternMatches: number;
  avgTeleopCycles: number;
  avgEndgamePartial: number;
  avgEndgameFull: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'avgTotalScore' | 'matchCount' | 'teamNumber'>('avgTotalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Only get current user's entries - private to each user
  const myEntries = user ? getEntriesByUser(user.id) : [];

  // Calculate team averages from user's entries only
  const teamStats = useMemo(() => {
    const teamsMap = new Map<string, ScoutingEntry[]>();
    
    // Group entries by team
    myEntries.forEach(entry => {
      const existing = teamsMap.get(entry.teamNumber) || [];
      teamsMap.set(entry.teamNumber, [...existing, entry]);
    });

    // Calculate stats for each team
    const stats: TeamStats[] = [];
    teamsMap.forEach((entries, teamNumber) => {
      const count = entries.length;
      
      const sumAuto = entries.reduce((sum, e) => sum + e.scores.autoScore, 0);
      const sumTeleop = entries.reduce((sum, e) => sum + e.scores.teleopScore, 0);
      const sumEndgame = entries.reduce((sum, e) => sum + e.scores.endgameScore, 0);
      const sumTotal = entries.reduce((sum, e) => sum + e.scores.totalScore, 0);
      const sumDefense = entries.reduce((sum, e) => sum + (e.defenseRating || 0), 0);
      const sumSpeed = entries.reduce((sum, e) => sum + (e.speedRating || 0), 0);
      
      // Detailed stats
      const sumAutoLeave = entries.reduce((sum, e) => sum + (e.auto?.leaveRobots || 0), 0);
      const sumAutoClassified = entries.reduce((sum, e) => sum + (e.auto?.classifiedArtifacts || 0), 0);
      const sumAutoOverflow = entries.reduce((sum, e) => sum + (e.auto?.overflowArtifacts || 0), 0);
      const sumAutoPattern = entries.reduce((sum, e) => sum + (e.auto?.patternMatches || 0), 0);
      
      const sumTeleopClassified = entries.reduce((sum, e) => sum + (e.teleop?.classifiedArtifacts || 0), 0);
      const sumTeleopOverflow = entries.reduce((sum, e) => sum + (e.teleop?.overflowArtifacts || 0), 0);
      const sumTeleopDepot = entries.reduce((sum, e) => sum + (e.teleop?.depotArtifacts || 0), 0);
      const sumTeleopPattern = entries.reduce((sum, e) => sum + (e.teleop?.patternMatches || 0), 0);
      const sumTeleopCycles = entries.reduce((sum, e) => sum + (e.teleop?.cyclesCompleted || 0), 0);
      
      const sumEndgamePartial = entries.reduce((sum, e) => sum + (e.endgame?.basePartialRobots || 0), 0);
      const sumEndgameFull = entries.reduce((sum, e) => sum + (e.endgame?.baseFullRobots || 0), 0);

      const scores = entries.map(e => e.scores.totalScore);

      stats.push({
        teamNumber,
        matchCount: count,
        avgAutoScore: Math.round((sumAuto / count) * 10) / 10,
        avgTeleopScore: Math.round((sumTeleop / count) * 10) / 10,
        avgEndgameScore: Math.round((sumEndgame / count) * 10) / 10,
        avgTotalScore: Math.round((sumTotal / count) * 10) / 10,
        avgDefenseRating: Math.round((sumDefense / count) * 10) / 10,
        avgSpeedRating: Math.round((sumSpeed / count) * 10) / 10,
        maxTotalScore: Math.max(...scores),
        minTotalScore: Math.min(...scores),
        avgAutoLeaveRobots: Math.round((sumAutoLeave / count) * 10) / 10,
        avgAutoClassified: Math.round((sumAutoClassified / count) * 10) / 10,
        avgAutoOverflow: Math.round((sumAutoOverflow / count) * 10) / 10,
        avgAutoPatternMatches: Math.round((sumAutoPattern / count) * 10) / 10,
        avgTeleopClassified: Math.round((sumTeleopClassified / count) * 10) / 10,
        avgTeleopOverflow: Math.round((sumTeleopOverflow / count) * 10) / 10,
        avgTeleopDepot: Math.round((sumTeleopDepot / count) * 10) / 10,
        avgTeleopPatternMatches: Math.round((sumTeleopPattern / count) * 10) / 10,
        avgTeleopCycles: Math.round((sumTeleopCycles / count) * 10) / 10,
        avgEndgamePartial: Math.round((sumEndgamePartial / count) * 10) / 10,
        avgEndgameFull: Math.round((sumEndgameFull / count) * 10) / 10,
      });
    });

    return stats;
  }, [myEntries]);

  // Filter and sort
  const filteredTeams = useMemo(() => {
    let teams = teamStats;

    if (searchTerm) {
      teams = teams.filter(t => t.teamNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    teams.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'avgTotalScore') {
        comparison = a.avgTotalScore - b.avgTotalScore;
      } else if (sortBy === 'matchCount') {
        comparison = a.matchCount - b.matchCount;
      } else {
        comparison = a.teamNumber.localeCompare(b.teamNumber);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return teams;
  }, [teamStats, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Team Analytics</h1>
              <p className="text-sm text-white/80">
                Comparing {teamStats.length} teams
              </p>
            </div>
          </div>

          {/* Top Team Highlight */}
          {filteredTeams.length > 0 && (
            <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/70">Top Performing Team</p>
                <p className="font-bold">Team {filteredTeams[0]?.teamNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{filteredTeams[0]?.avgTotalScore}</p>
                <p className="text-xs text-white/70">avg pts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 -mt-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by team number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Sort buttons */}
          <div className="flex gap-2">
            <SortButton
              label="Score"
              active={sortBy === 'avgTotalScore'}
              order={sortBy === 'avgTotalScore' ? sortOrder : undefined}
              onClick={() => toggleSort('avgTotalScore')}
            />
            <SortButton
              label="Matches"
              active={sortBy === 'matchCount'}
              order={sortBy === 'matchCount' ? sortOrder : undefined}
              onClick={() => toggleSort('matchCount')}
            />
            <SortButton
              label="Team #"
              active={sortBy === 'teamNumber'}
              order={sortBy === 'teamNumber' ? sortOrder : undefined}
              onClick={() => toggleSort('teamNumber')}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-3">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {myEntries.length === 0 ? 'No Data Yet' : 'No Results'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              {myEntries.length === 0 
                ? 'Start scouting teams to see analytics and performance comparisons'
                : `No teams match "${searchTerm}"`}
            </p>
          </div>
        ) : (
          filteredTeams.map((team, index) => (
            <TeamCard
              key={team.teamNumber}
              team={team}
              rank={sortBy === 'avgTotalScore' ? index + 1 : undefined}
              expanded={expandedTeam === team.teamNumber}
              onToggle={() => setExpandedTeam(expandedTeam === team.teamNumber ? null : team.teamNumber)}
            />
          ))
        )}
      </div>

      {/* AI Section */}
      {myEntries.length > 0 && (
        <div className="px-4 mt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Tools</h2>
          </div>
          
          <AIInsights entries={myEntries} />
          <AITeamComparison entries={myEntries} />
          <AIMatchPredictor entries={myEntries} />
        </div>
      )}
    </div>
  );
};

interface SortButtonProps {
  label: string;
  active: boolean;
  order?: 'asc' | 'desc';
  onClick: () => void;
}

const SortButton: React.FC<SortButtonProps> = ({ label, active, order, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
      active
        ? 'bg-primary-600 text-white'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
    }`}
  >
    {label}
    {active && order && (
      order === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
    )}
  </button>
);

interface TeamCardProps {
  team: TeamStats;
  rank?: number;
  expanded: boolean;
  onToggle: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, rank, expanded, onToggle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Main card content */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {rank && rank <= 3 && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                rank === 2 ? 'bg-gray-100 dark:bg-gray-700' :
                'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <Trophy className={`w-4 h-4 ${
                  rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                  rank === 2 ? 'text-gray-500 dark:text-gray-400' :
                  'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Team {team.teamNumber}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {team.matchCount} match{team.matchCount !== 1 ? 'es' : ''} scouted
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {team.avgTotalScore}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">avg pts</p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Auto" value={team.avgAutoScore} color="blue" />
          <StatBox label="Tele-Op" value={team.avgTeleopScore} color="green" />
          <StatBox label="Endgame" value={team.avgEndgameScore} color="purple" />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Score range */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">{team.minTotalScore}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{team.avgTotalScore}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="text-center flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">{team.maxTotalScore}</p>
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="space-y-4">
            {/* Auto Phase */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Autonomous Phase</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DetailStat label="Leave Robots" value={team.avgAutoLeaveRobots} />
                <DetailStat label="Classified Artifacts" value={team.avgAutoClassified} />
                <DetailStat label="Overflow Artifacts" value={team.avgAutoOverflow} />
                <DetailStat label="Pattern Matches" value={team.avgAutoPatternMatches} />
              </div>
            </div>

            {/* Teleop Phase */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Tele-Op Phase</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DetailStat label="Classified Artifacts" value={team.avgTeleopClassified} />
                <DetailStat label="Overflow Artifacts" value={team.avgTeleopOverflow} />
                <DetailStat label="Depot Artifacts" value={team.avgTeleopDepot} />
                <DetailStat label="Pattern Matches" value={team.avgTeleopPatternMatches} />
                <DetailStat label="Cycles/Match" value={team.avgTeleopCycles} />
              </div>
            </div>

            {/* Endgame */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Endgame (Base Return)</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <DetailStat label="Partial Returns" value={team.avgEndgamePartial} />
                <DetailStat label="Full Returns" value={team.avgEndgameFull} />
              </div>
            </div>

            {/* Ratings */}
            {(team.avgDefenseRating > 0 || team.avgSpeedRating > 0) && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Ratings</h4>
                <div className="grid grid-cols-2 gap-2">
                  <DetailStat label="Defense" value={team.avgDefenseRating} suffix="/5" />
                  <DetailStat label="Speed" value={team.avgSpeedRating} suffix="/5" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatBoxProps {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple';
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg p-2 text-center ${colorClasses[color]}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
};

interface DetailStatProps {
  label: string;
  value: number;
  suffix?: string;
}

const DetailStat: React.FC<DetailStatProps> = ({ label, value, suffix = '' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">
      {value}{suffix}
    </p>
  </div>
);

export default Analytics;
