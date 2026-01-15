import React, { useState } from 'react';
import { ScoutingEntry } from '../types';
import { Loader2, Scale, Sparkles } from 'lucide-react';

const AI_BASE = import.meta.env.VITE_AI_API_URL?.replace(/\/$/, '') || '';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || '';

interface Props {
  entries: ScoutingEntry[];
}

const AITeamComparison: React.FC<Props> = ({ entries }) => {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [comparison, setComparison] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get unique team numbers
  const uniqueTeams = [...new Set(entries.map(e => e.teamNumber))].sort();

  const getTeamStats = (teamNumber: string) => {
    const teamEntries = entries.filter(e => e.teamNumber === teamNumber);
    if (teamEntries.length === 0) return null;

    const avgTotal = Math.round(teamEntries.reduce((sum, e) => sum + e.scores.totalScore, 0) / teamEntries.length);
    const avgAuto = Math.round(teamEntries.reduce((sum, e) => sum + e.scores.autoScore, 0) / teamEntries.length);
    const avgTeleop = Math.round(teamEntries.reduce((sum, e) => sum + e.scores.teleopScore, 0) / teamEntries.length);
    const avgEndgame = Math.round(teamEntries.reduce((sum, e) => sum + e.scores.endgameScore, 0) / teamEntries.length);
    const highScore = Math.max(...teamEntries.map(e => e.scores.totalScore));
    const avgDefense = Math.round(teamEntries.reduce((sum, e) => sum + (e.defenseRating || 3), 0) / teamEntries.length * 10) / 10;
    const avgSpeed = Math.round(teamEntries.reduce((sum, e) => sum + (e.speedRating || 3), 0) / teamEntries.length * 10) / 10;
    const consistency = Math.round((1 - standardDeviation(teamEntries.map(e => e.scores.totalScore)) / (avgTotal || 1)) * 100);

    return { teamNumber, entries: teamEntries.length, avgTotal, avgAuto, avgTeleop, avgEndgame, highScore, avgDefense, avgSpeed, consistency };
  };

  const standardDeviation = (values: number[]) => {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  };

  const compare = async () => {
    if (!team1 || !team2 || team1 === team2) {
      setError('Please select two different teams');
      return;
    }

    const stats1 = getTeamStats(team1);
    const stats2 = getTeamStats(team2);

    if (!stats1 || !stats2) {
      setError('Not enough data for one or both teams');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Try AI API first
      if (AI_BASE) {
        const res = await fetch(AI_BASE + '/v1/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ team1: stats1, team2: stats2 }),
        });
        if (res.ok) {
          const data = await res.json();
          setComparison(data.comparison || data.result || JSON.stringify(data));
          return;
        }
      }

      // Try proxy
      if (PROXY_BASE) {
        try {
          const res = await fetch(PROXY_BASE + '/api/ai/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team1: stats1, team2: stats2 }),
          });
          if (res.ok) {
            const data = await res.json();
            setComparison(data.comparison || data.result || JSON.stringify(data));
            return;
          }
        } catch (e) {
          // Fall through to local
        }
      }

      // Local comparison
      setComparison(localCompare(stats1, stats2));
    } catch (e) {
      setError((e as Error).message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const localCompare = (s1: any, s2: any): string => {
    const parts: string[] = [];
    
    parts.push(`📊 **Team ${s1.teamNumber} vs Team ${s2.teamNumber}**\n`);
    
    // Overall scoring
    const scoreDiff = s1.avgTotal - s2.avgTotal;
    if (Math.abs(scoreDiff) <= 5) {
      parts.push(`🎯 **Scoring:** Very close! Both teams average around ${s1.avgTotal}-${s2.avgTotal} points.`);
    } else if (scoreDiff > 0) {
      parts.push(`🎯 **Scoring:** Team ${s1.teamNumber} leads with ${s1.avgTotal} avg pts vs ${s2.avgTotal}. (+${scoreDiff})`);
    } else {
      parts.push(`🎯 **Scoring:** Team ${s2.teamNumber} leads with ${s2.avgTotal} avg pts vs ${s1.avgTotal}. (+${Math.abs(scoreDiff)})`);
    }

    // Auto comparison
    if (s1.avgAuto > s2.avgAuto + 3) {
      parts.push(`🤖 **Autonomous:** Team ${s1.teamNumber} has stronger auto (${s1.avgAuto} vs ${s2.avgAuto}).`);
    } else if (s2.avgAuto > s1.avgAuto + 3) {
      parts.push(`🤖 **Autonomous:** Team ${s2.teamNumber} has stronger auto (${s2.avgAuto} vs ${s1.avgAuto}).`);
    } else {
      parts.push(`🤖 **Autonomous:** Both teams are comparable in auto phase.`);
    }

    // Teleop comparison
    if (s1.avgTeleop > s2.avgTeleop + 5) {
      parts.push(`🎮 **Tele-Op:** Team ${s1.teamNumber} excels in tele-op (${s1.avgTeleop} vs ${s2.avgTeleop}).`);
    } else if (s2.avgTeleop > s1.avgTeleop + 5) {
      parts.push(`🎮 **Tele-Op:** Team ${s2.teamNumber} excels in tele-op (${s2.avgTeleop} vs ${s1.avgTeleop}).`);
    }

    // Consistency
    if (s1.consistency > s2.consistency + 10) {
      parts.push(`📈 **Consistency:** Team ${s1.teamNumber} is more consistent (${s1.consistency}% vs ${s2.consistency}%).`);
    } else if (s2.consistency > s1.consistency + 10) {
      parts.push(`📈 **Consistency:** Team ${s2.teamNumber} is more consistent (${s2.consistency}% vs ${s1.consistency}%).`);
    }

    // Peak performance
    parts.push(`\n⭐ **Peak Scores:** Team ${s1.teamNumber}: ${s1.highScore} | Team ${s2.teamNumber}: ${s2.highScore}`);

    // Recommendation
    parts.push('\n**💡 Recommendation:**');
    if (scoreDiff > 10) {
      parts.push(`Team ${s1.teamNumber} is the stronger pick overall based on scoring data.`);
    } else if (scoreDiff < -10) {
      parts.push(`Team ${s2.teamNumber} is the stronger pick overall based on scoring data.`);
    } else {
      parts.push(`Both teams are evenly matched. Consider other factors like driver skill and specific game tasks.`);
    }

    return parts.join('\n');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Team Comparison</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team 1</label>
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
          >
            <option value="">Select team...</option>
            {uniqueTeams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team 2</label>
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base"
          >
            <option value="">Select team...</option>
            {uniqueTeams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={compare}
        disabled={loading || !team1 || !team2}
        className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        Compare Teams
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {comparison && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {comparison.split('\n').map((line, i) => {
              if (line.startsWith('**') || line.includes('**')) {
                return <p key={i} className="font-medium" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITeamComparison;
