import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEntriesByUser, getScoutingEntries } from '../utils/storage';
import { subscribeToAllEntries, subscribeToUserEntries, isFirebaseConfigured } from '../services/apiClient';
import { ScoutingEntry } from '../types';
import { Search, Plus, Trophy, TrendingUp, Target, Zap, Sparkles, ClipboardList, ChevronRight, Users, User, Cloud, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'teamNumber' | 'totalScore'>('timestamp');
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');
  const [cloudEntries, setCloudEntries] = useState<ScoutingEntry[]>([]);
  const [myCloudEntries, setMyCloudEntries] = useState<ScoutingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isCloudMode = isFirebaseConfigured();

  // Subscribe to real-time updates when using cloud mode
  useEffect(() => {
    if (isCloudMode && user) {
      setIsLoading(true);
      
      // Subscribe to all entries
      const unsubAll = subscribeToAllEntries((entries) => {
        setCloudEntries(entries);
        setIsLoading(false);
      });
      
      // Subscribe to user's entries
      const unsubUser = subscribeToUserEntries(user.id, (entries) => {
        setMyCloudEntries(entries);
      });
      
      return () => {
        unsubAll();
        unsubUser();
      };
    } else {
      setIsLoading(false);
    }
  }, [isCloudMode, user]);

  // Get entries based on view mode and storage type
  const myEntries = isCloudMode ? myCloudEntries : (user ? getEntriesByUser(user.id) : []);
  const allEntries = isCloudMode ? cloudEntries : getScoutingEntries();
  const displayEntries = viewMode === 'my' ? myEntries : allEntries;

  const filteredEntries = useMemo(() => {
    let entries = [...displayEntries];

    // Search by team number or match number
    if (searchTerm) {
      entries = entries.filter(e =>
        e.teamNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (viewMode === 'all' && e.username?.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [displayEntries, searchTerm, sortBy, viewMode]);

  const uniqueTeams = new Set(myEntries.map(e => e.teamNumber)).size;
  
  // Calculate averages
  const avgScore = myEntries.length > 0 
    ? Math.round(myEntries.reduce((sum, e) => sum + e.scores.totalScore, 0) / myEntries.length)
    : 0;
  const highScore = myEntries.length > 0
    ? Math.max(...myEntries.map(e => e.scores.totalScore))
    : 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-primary-200 text-sm font-medium">{getGreeting()} 👋</p>
                {isCloudMode && (
                  <span className="bg-green-400/20 text-green-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Cloud className="w-3 h-3" /> Synced
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold mt-1">{user?.username}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">{myEntries.length}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 opacity-90" />
              <p className="text-xl font-bold">{myEntries.length}</p>
              <p className="text-xs opacity-80">Entries</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 opacity-90" />
              <p className="text-xl font-bold">{uniqueTeams}</p>
              <p className="text-xs opacity-80">Teams</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 opacity-90" />
              <p className="text-xl font-bold">{avgScore}</p>
              <p className="text-xs opacity-80">Avg</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 opacity-90" />
              <p className="text-xl font-bold">{highScore}</p>
              <p className="text-xs opacity-80">Best</p>
            </div>
          </div>
          {isCloudMode && (
            <div className="mt-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Entries saved in Cloud mode are visible to all authenticated users.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 -mt-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setViewMode('my')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                viewMode === 'my'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              My Entries
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                viewMode === 'all'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              All Entries ({allEntries.length})
            </button>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={viewMode === 'all' ? "Search team, match, or scout..." : "Search team or match..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="timestamp">📅 Recent First</option>
            <option value="teamNumber">🔢 Team Number</option>
            <option value="totalScore">⭐ Highest Score</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      <div className="px-4 py-4 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No results found' : (viewMode === 'all' ? 'No entries yet' : 'Start Scouting!')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
              {searchTerm 
                ? `No entries match "${searchTerm}"`
                : viewMode === 'all' 
                  ? 'No one has created any scouting entries yet'
                  : 'Create your first scouting entry to start tracking team performance'}
            </p>
            {!searchTerm && viewMode === 'my' && (
              <button
                onClick={() => navigate('/scout')}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                New Entry
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {viewMode === 'my' ? 'My Entries' : 'All Entries'}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onClick={() => navigate(`/entry/${entry.id}`)} showScout={viewMode === 'all'} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

interface EntryCardProps {
  entry: ScoutingEntry;
  onClick: () => void;
  showScout?: boolean;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick, showScout = false }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 active:scale-[0.98] group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Team {entry.teamNumber}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              entry.alliance === 'red'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}>
              {entry.alliance === 'red' ? '🔴' : '🔵'} {entry.alliance.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Match {entry.matchNumber}
          </p>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              {entry.scores.totalScore}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">total pts</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl p-2">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Auto</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {entry.scores.autoScore}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 rounded-xl p-2">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Tele-Op</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            {entry.scores.teleopScore}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/10 rounded-xl p-2">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Endgame</p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {entry.scores.endgameScore}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          📍 {entry.auto?.startPosition?.replace('-', ' ') || 'N/A'}
        </span>
        <div className="flex items-center gap-2">
          {showScout && entry.username && (
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              👤 {entry.username}
            </span>
          )}
          <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
