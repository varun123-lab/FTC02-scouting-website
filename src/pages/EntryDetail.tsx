import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScoutingEntries } from '../utils/storage';
import { ArrowLeft, Edit, MapPin, Zap, Shield } from 'lucide-react';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const entry = getScoutingEntries().find(e => e.id === id);

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Entry not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary-600 dark:text-primary-400 font-medium"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Entry Details</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Team Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm opacity-90">Team Number</p>
              <h2 className="text-4xl font-bold">{entry.teamNumber}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Score</p>
              <p className="text-4xl font-bold">{entry.scores.totalScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span>Match {entry.matchNumber}</span>
            <span>•</span>
            <span className="capitalize">{entry.alliance} Alliance</span>
            <span>•</span>
            <span>by {entry.username}</span>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-medium text-green-900 dark:text-green-200">Autonomous</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {entry.scores.autoScore}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-medium text-blue-900 dark:text-blue-200">Tele-Op</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {entry.scores.teleopScore}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="font-medium text-purple-900 dark:text-purple-200">Endgame</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {entry.scores.endgameScore}
              </span>
            </div>
          </div>
        </div>

        {/* Autonomous Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Autonomous Phase
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Start Position" value={entry.auto.startPosition} />
            <DetailRow label="Artifacts Scored" value={(entry.auto as any).artifactsScored || 0} />
            <DetailRow label="Path Drawn" value={(entry.auto as any).autoPath ? 'Yes' : 'No'} />
            {(entry.auto as any).pathNotes && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Path Notes:</p>
                <p className="text-gray-900 dark:text-white">{(entry.auto as any).pathNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tele-Op Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Tele-Op Phase
          </h3>
          <div className="space-y-2 text-sm">
            <DetailRow label="Artifacts Scored" value={(entry.teleop as any).artifactsScored || 0} />
            <DetailRow label="Cycles Completed" value={(entry.teleop as any).cyclesCompleted || 0} />
          </div>
        </div>

        {/* Endgame Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Endgame Phase</h3>
          <div className="space-y-2 text-sm">
            <DetailRow 
              label="Robot Action" 
              value={
                (entry.endgame as any).action === 'none' ? 'None (0 pts)' :
                (entry.endgame as any).action === 'parked' ? 'Parked (5 pts)' :
                (entry.endgame as any).action === 'hanging' ? 'Hanging (10 pts)' : 'Unknown'
              } 
            />
          </div>
        </div>

        {/* Performance Ratings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Performance Ratings
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Defense</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.defenseRating}/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(entry.defenseRating / 5) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Speed</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{entry.speedRating}/5</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(entry.speedRating / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.notes}</p>
          </div>
        )}

        {/* Timestamp */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Recorded on {new Date(entry.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string | number;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white capitalize">{value}</span>
    </div>
  );
};

export default EntryDetail;
