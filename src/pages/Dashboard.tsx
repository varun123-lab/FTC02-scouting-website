import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getScoutingEntries } from '../utils/storage';
import { ScoutingEntry } from '../types';
import { Search, Filter, Plus, Trophy } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'teamNumber' | 'totalScore'>('timestamp');

  const allEntries = getScoutingEntries();

  const filteredEntries = useMemo(() => {
    let entries = allEntries;

    // Filter by user
    if (filterUser !== 'all') {
      entries = entries.filter(e => e.userId === filterUser);
    }

    // Search by team number or match number
    if (searchTerm) {
      entries = entries.filter(e =>
        e.teamNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort entries
    entries.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'teamNumber') {
        return a.teamNumber.localeCompare(b.teamNumber);
      } else {
        return b.scores.totalScore - a.scores.totalScore;
      }
    });

    return entries;
  }, [allEntries, searchTerm, filterUser, sortBy]);

  const userEntries = allEntries.filter(e => e.userId === user?.id);
  const uniqueUsers = Array.from(new Set(allEntries.map(e => e.username)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user?.username}</p>
            </div>
            <button
              onClick={() => navigate('/scout')}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">My Entries</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-200">{userEntries.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Entries</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200">{allEntries.length}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Scouts</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{uniqueUsers.length}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team or match..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Scouts</option>
                <option value={user?.id}>My Entries</option>
                {uniqueUsers.filter(u => u !== user?.username).map(username => (
                  <option key={username} value={allEntries.find(e => e.username === username)?.userId}>
                    {username}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="timestamp">Recent First</option>
                <option value="teamNumber">Team Number</option>
                <option value="totalScore">Highest Score</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="px-4 py-4 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No scouting entries yet</p>
            <button
              onClick={() => navigate('/scout')}
              className="text-primary-600 dark:text-primary-400 font-medium"
            >
              Create your first entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onClick={() => navigate(`/entry/${entry.id}`)} />
          ))
        )}
      </div>
    </div>
  );
};

interface EntryCardProps {
  entry: ScoutingEntry;
  onClick: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Team {entry.teamNumber}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              entry.alliance === 'red'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {entry.alliance.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Match {entry.matchNumber} • {entry.username}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {entry.scores.totalScore}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Auto</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.scores.autoScore}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Tele-Op</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.scores.teleopScore}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Endgame</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.scores.endgameScore}
          </p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {new Date(entry.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default Dashboard;
