import React, { useState, useMemo } from 'react';
import { ScoutingEntry } from '../types';
import { Sparkles, TrendingUp, AlertTriangle, Star, RefreshCw } from 'lucide-react';

interface Props {
  entries: ScoutingEntry[];
}

interface Insight {
  type: 'positive' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AIInsights: React.FC<Props> = ({ entries }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const insights = useMemo(() => {
    if (entries.length === 0) return [];

    const result: Insight[] = [];
    const uniqueTeams = [...new Set(entries.map(e => e.teamNumber))];

    // Calculate overall stats
    const avgTotal = entries.reduce((sum, e) => sum + e.scores.totalScore, 0) / entries.length;
    const avgAuto = entries.reduce((sum, e) => sum + e.scores.autoScore, 0) / entries.length;
    const avgTeleop = entries.reduce((sum, e) => sum + e.scores.teleopScore, 0) / entries.length;
    const avgEndgame = entries.reduce((sum, e) => sum + e.scores.endgameScore, 0) / entries.length;

    // Find top performers
    const teamStats = uniqueTeams.map(team => {
      const teamEntries = entries.filter(e => e.teamNumber === team);
      return {
        team,
        avgScore: teamEntries.reduce((sum, e) => sum + e.scores.totalScore, 0) / teamEntries.length,
        avgAuto: teamEntries.reduce((sum, e) => sum + e.scores.autoScore, 0) / teamEntries.length,
        avgTeleop: teamEntries.reduce((sum, e) => sum + e.scores.teleopScore, 0) / teamEntries.length,
        avgEndgame: teamEntries.reduce((sum, e) => sum + e.scores.endgameScore, 0) / teamEntries.length,
        matches: teamEntries.length,
      };
    });

    const sortedByScore = [...teamStats].sort((a, b) => b.avgScore - a.avgScore);
    const sortedByAuto = [...teamStats].sort((a, b) => b.avgAuto - a.avgAuto);
    const sortedByTeleop = [...teamStats].sort((a, b) => b.avgTeleop - a.avgTeleop);

    // Top scorer insight
    if (sortedByScore.length > 0) {
      const top = sortedByScore[0];
      result.push({
        type: 'positive',
        icon: <Star className="w-5 h-5 text-yellow-500" />,
        title: `Team ${top.team} leads scoring`,
        description: `Averaging ${Math.round(top.avgScore)} pts/match across ${top.matches} matches. ${Math.round((top.avgScore / avgTotal - 1) * 100)}% above average.`,
      });
    }

    // Best auto team
    if (sortedByAuto.length > 0 && sortedByAuto[0].avgAuto > avgAuto * 1.2) {
      const top = sortedByAuto[0];
      result.push({
        type: 'positive',
        icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
        title: `Strong autonomous: Team ${top.team}`,
        description: `Scores ${Math.round(top.avgAuto)} pts in auto phase, ${Math.round((top.avgAuto / avgAuto - 1) * 100)}% above field average.`,
      });
    }

    // Best teleop team (if different from top scorer)
    if (sortedByTeleop.length > 0 && sortedByTeleop[0].team !== sortedByScore[0]?.team && sortedByTeleop[0].avgTeleop > avgTeleop * 1.2) {
      const top = sortedByTeleop[0];
      result.push({
        type: 'positive',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        title: `Tele-Op specialist: Team ${top.team}`,
        description: `Dominates in tele-op with ${Math.round(top.avgTeleop)} avg pts. Great cycle efficiency.`,
      });
    }

    // Warning: Inconsistent teams
    const inconsistentTeams = teamStats.filter(t => {
      const teamEntries = entries.filter(e => e.teamNumber === t.team);
      if (teamEntries.length < 2) return false;
      const scores = teamEntries.map(e => e.scores.totalScore);
      const stdDev = Math.sqrt(scores.map(s => Math.pow(s - t.avgScore, 2)).reduce((a, b) => a + b, 0) / scores.length);
      return stdDev > t.avgScore * 0.3; // High variance
    });

    if (inconsistentTeams.length > 0) {
      result.push({
        type: 'warning',
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        title: `Watch: Inconsistent performance`,
        description: `Teams ${inconsistentTeams.slice(0, 3).map(t => t.team).join(', ')} show high score variance. Consider match-by-match analysis.`,
      });
    }

    // Insight about weak areas
    if (avgEndgame < 10) {
      result.push({
        type: 'info',
        icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        title: 'Field-wide: Endgame opportunity',
        description: `Average endgame score is only ${Math.round(avgEndgame)} pts. Teams with reliable returns will have an advantage.`,
      });
    }

    // Rising star: team with improving scores
    const teamsWithMultipleMatches = teamStats.filter(t => t.matches >= 2);
    for (const teamStat of teamsWithMultipleMatches) {
      const teamEntries = entries
        .filter(e => e.teamNumber === teamStat.team)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      if (teamEntries.length >= 2) {
        const firstHalf = teamEntries.slice(0, Math.floor(teamEntries.length / 2));
        const secondHalf = teamEntries.slice(Math.floor(teamEntries.length / 2));
        const firstAvg = firstHalf.reduce((sum, e) => sum + e.scores.totalScore, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, e) => sum + e.scores.totalScore, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.25) {
          result.push({
            type: 'positive',
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            title: `Rising star: Team ${teamStat.team}`,
            description: `Improved from ${Math.round(firstAvg)} to ${Math.round(secondAvg)} avg pts. Watch for their next matches!`,
          });
          break; // Only show one rising star
        }
      }
    }

    // Alliance recommendation
    if (sortedByScore.length >= 3) {
      const top3 = sortedByScore.slice(0, 3);
      result.push({
        type: 'info',
        icon: <Sparkles className="w-5 h-5 text-primary-500" />,
        title: 'Pick recommendation',
        description: `Top picks: ${top3.map(t => `Team ${t.team} (${Math.round(t.avgScore)})`).join(', ')}`,
      });
    }

    return result.slice(0, 5); // Limit to 5 insights
  }, [entries, refreshKey]);

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Add scouting entries to see AI-powered insights
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl flex items-start gap-3 ${
              insight.type === 'positive'
                ? 'bg-green-50 dark:bg-green-900/20'
                : insight.type === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-primary-50 dark:bg-primary-900/20'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
            <div>
              <p className={`font-medium ${
                insight.type === 'positive'
                  ? 'text-green-800 dark:text-green-300'
                  : insight.type === 'warning'
                  ? 'text-yellow-800 dark:text-yellow-300'
                  : 'text-primary-800 dark:text-primary-300'
              }`}>
                {insight.title}
              </p>
              <p className={`text-sm mt-0.5 ${
                insight.type === 'positive'
                  ? 'text-green-700 dark:text-green-400'
                  : insight.type === 'warning'
                  ? 'text-yellow-700 dark:text-yellow-400'
                  : 'text-primary-700 dark:text-primary-400'
              }`}>
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
