import React, { useState } from 'react';
import { ScoutingEntry } from '../types';
import { Loader2, Trophy, Zap, Target } from 'lucide-react';

const AI_BASE = import.meta.env.VITE_AI_API_URL?.replace(/\/$/, '') || '';
const PROXY_BASE = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || '';

interface Props {
  entries: ScoutingEntry[];
}

const AIMatchPredictor: React.FC<Props> = ({ entries }) => {
  const [redTeams, setRedTeams] = useState<string[]>(['', '']);
  const [blueTeams, setBlueTeams] = useState<string[]>(['', '']);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const uniqueTeams = [...new Set(entries.map(e => e.teamNumber))].sort();

  const getTeamData = (teamNumber: string) => {
    const teamEntries = entries.filter(e => e.teamNumber === teamNumber);
    if (teamEntries.length === 0) return null;

    const scores = teamEntries.map(e => e.scores.totalScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(scores.map(s => Math.pow(s - avg, 2)).reduce((a, b) => a + b, 0) / scores.length);
    const consistency = Math.round((1 - stdDev / (avg || 1)) * 100);

    const avgAuto = teamEntries.reduce((sum, e) => sum + e.scores.autoScore, 0) / teamEntries.length;
    const avgTeleop = teamEntries.reduce((sum, e) => sum + e.scores.teleopScore, 0) / teamEntries.length;
    const avgEndgame = teamEntries.reduce((sum, e) => sum + e.scores.endgameScore, 0) / teamEntries.length;

    const strengths: string[] = [];
    if (avgAuto >= 15) strengths.push('Strong Auto');
    if (avgTeleop >= 25) strengths.push('High Tele-Op');
    if (avgEndgame >= 15) strengths.push('Reliable Endgame');

    return {
      teamNumber,
      avgScore: Math.round(avg),
      avgAuto: Math.round(avgAuto),
      avgTeleop: Math.round(avgTeleop),
      avgEndgame: Math.round(avgEndgame),
      consistency,
      strengths,
      matches: teamEntries.length,
    };
  };

  const predict = async () => {
    const redData = redTeams.filter(t => t).map(getTeamData).filter(Boolean);
    const blueData = blueTeams.filter(t => t).map(getTeamData).filter(Boolean);

    if (redData.length === 0 || blueData.length === 0) {
      return;
    }

    setLoading(true);

    try {
      // Try AI API
      if (AI_BASE) {
        const res = await fetch(AI_BASE + '/v1/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ red: redData, blue: blueData }),
        });
        if (res.ok) {
          const data = await res.json();
          setPrediction(data);
          return;
        }
      }

      // Try proxy
      if (PROXY_BASE) {
        try {
          const res = await fetch(PROXY_BASE + '/api/ai/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ red: redData, blue: blueData }),
          });
          if (res.ok) {
            const data = await res.json();
            setPrediction(data);
            return;
          }
        } catch (e) {
          // Fall through
        }
      }

      // Local prediction
      setPrediction(localPredict(redData as any[], blueData as any[]));
    } finally {
      setLoading(false);
    }
  };

  const localPredict = (redData: any[], blueData: any[]) => {
    const redTotal = redData.reduce((sum, t) => sum + t.avgScore, 0);
    const blueTotal = blueData.reduce((sum, t) => sum + t.avgScore, 0);
    
    const redConsistency = redData.reduce((sum, t) => sum + t.consistency, 0) / redData.length;
    const blueConsistency = blueData.reduce((sum, t) => sum + t.consistency, 0) / blueData.length;

    // Add some variance based on consistency
    const redVariance = (100 - redConsistency) / 100 * redTotal * 0.15;
    const blueVariance = (100 - blueConsistency) / 100 * blueTotal * 0.15;

    const redLow = Math.round(redTotal - redVariance);
    const redHigh = Math.round(redTotal + redVariance);
    const blueLow = Math.round(blueTotal - blueVariance);
    const blueHigh = Math.round(blueTotal + blueVariance);

    const diff = redTotal - blueTotal;
    let winProbability: number;
    let winner: 'red' | 'blue';

    if (Math.abs(diff) < 10) {
      winProbability = 50 + (diff / 20) * 10;
      winner = diff >= 0 ? 'red' : 'blue';
    } else {
      winProbability = Math.min(95, 50 + Math.abs(diff) / 2);
      winner = diff > 0 ? 'red' : 'blue';
    }

    if (winner === 'blue') {
      winProbability = 100 - winProbability;
    }

    const keyFactors: string[] = [];
    
    // Analyze key factors
    const redAutoTotal = redData.reduce((sum, t) => sum + t.avgAuto, 0);
    const blueAutoTotal = blueData.reduce((sum, t) => sum + t.avgAuto, 0);
    if (Math.abs(redAutoTotal - blueAutoTotal) > 10) {
      keyFactors.push(`${redAutoTotal > blueAutoTotal ? 'Red' : 'Blue'} has auto advantage (+${Math.abs(redAutoTotal - blueAutoTotal)} pts)`);
    }

    if (Math.abs(redConsistency - blueConsistency) > 15) {
      keyFactors.push(`${redConsistency > blueConsistency ? 'Red' : 'Blue'} alliance is more consistent`);
    }

    return {
      winner,
      redScore: { low: redLow, expected: Math.round(redTotal), high: redHigh },
      blueScore: { low: blueLow, expected: Math.round(blueTotal), high: blueHigh },
      winProbability: Math.round(winner === 'red' ? winProbability : 100 - winProbability),
      keyFactors,
      confidence: Math.min(redData.length, blueData.length) >= 3 ? 'High' : 'Low (need more data)',
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Match Predictor</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Red Alliance */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            🔴 Red Alliance
          </h4>
          <div className="space-y-2">
            {redTeams.map((team, i) => (
              <select
                key={i}
                value={team}
                onChange={(e) => {
                  const newTeams = [...redTeams];
                  newTeams[i] = e.target.value;
                  setRedTeams(newTeams);
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Team {i + 1}...</option>
                {uniqueTeams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Blue Alliance */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
            🔵 Blue Alliance
          </h4>
          <div className="space-y-2">
            {blueTeams.map((team, i) => (
              <select
                key={i}
                value={team}
                onChange={(e) => {
                  const newTeams = [...blueTeams];
                  newTeams[i] = e.target.value;
                  setBlueTeams(newTeams);
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Team {i + 1}...</option>
                {uniqueTeams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={predict}
        disabled={loading || (!redTeams.some(t => t) || !blueTeams.some(t => t))}
        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
        Predict Match
      </button>

      {prediction && (
        <div className="mt-4 space-y-4">
          {/* Score Prediction */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl text-center ${prediction.winner === 'red' ? 'bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Red Alliance</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{prediction.redScore.expected}</p>
              <p className="text-xs text-red-500 dark:text-red-400">Range: {prediction.redScore.low}-{prediction.redScore.high}</p>
            </div>
            <div className={`p-4 rounded-xl text-center ${prediction.winner === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Blue Alliance</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{prediction.blueScore.expected}</p>
              <p className="text-xs text-blue-500 dark:text-blue-400">Range: {prediction.blueScore.low}-{prediction.blueScore.high}</p>
            </div>
          </div>

          {/* Win Probability */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Win Probability</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Confidence: {prediction.confidence}</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
              <div 
                className="bg-red-500 h-full transition-all" 
                style={{ width: `${prediction.winProbability}%` }}
              />
              <div 
                className="bg-blue-500 h-full transition-all" 
                style={{ width: `${100 - prediction.winProbability}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-red-600 dark:text-red-400 font-medium">{prediction.winProbability}%</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">{100 - prediction.winProbability}%</span>
            </div>
          </div>

          {/* Key Factors */}
          {prediction.keyFactors && prediction.keyFactors.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Key Factors
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                {prediction.keyFactors.map((f: string, i: number) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMatchPredictor;
