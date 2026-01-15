import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Moon, Sun, User, Database, Info, Download, Upload, FileJson, FileSpreadsheet, FileText, TrendingUp, Target, Users, Settings as SettingsIcon, Sparkles, Shield } from 'lucide-react';
import { exportDataAsJSON, exportDataAsCSV, exportDataAsWord, importDataFromJSON, getScoutingEntries, getEntriesByUser, exportUserDataAsJSON, exportUserDataAsCSV, exportUserDataAsWord, getUserStats } from '../utils/storage';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleExportJSON = () => {
    exportDataAsJSON();
  };

  const handleExportCSV = () => {
    exportDataAsCSV();
  };

  const handleExportWord = async () => {
    await exportDataAsWord();
  };

  const handleExportMyJSON = () => {
    if (user) {
      exportUserDataAsJSON(user.id, user.username);
    }
  };

  const handleExportMyCSV = () => {
    if (user) {
      exportUserDataAsCSV(user.id, user.username);
    }
  };

  const handleExportMyWord = async () => {
    if (user) {
      await exportUserDataAsWord(user.id, user.username);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await importDataFromJSON(file);
      setImportStatus(`Successfully imported ${count} new entries!`);
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus('Failed to import data. Please check the file format.');
      setTimeout(() => setImportStatus(null), 3000);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const entryCount = getScoutingEntries().length;
  const myEntryCount = user ? getEntriesByUser(user.id).length : 0;
  const myStats = user ? getUserStats(user.id) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
        <div className="px-4 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3.5 h-3.5 text-primary-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Scout Account</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary-50 dark:bg-primary-900/30 rounded-full px-3 py-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{myEntryCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Stats */}
        {myStats && myStats.totalEntries > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Statistics</h2>
            </div>
            <div className="p-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{myStats.totalEntries}</p>
                  <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">Entries Scouted</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{myStats.uniqueTeams}</p>
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">Unique Teams</p>
                </div>
              </div>
              
              {/* Average Scores */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Average Scores (from my entries)
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{myStats.avgAutoScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Auto</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{myStats.avgTeleopScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teleop</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{myStats.avgEndgameScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Endgame</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{myStats.avgTotalScore}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  </div>
                </div>
              </div>

              {/* Score Range */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lowest</p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">{myStats.lowestScore}</p>
                </div>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Highest</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{myStats.highestScore}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-gray-900 dark:text-white font-medium">Theme</span>
            </div>
            <span className="text-gray-500 dark:text-gray-400 capitalize">{theme}</span>
          </button>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data</h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Local Storage</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {entryCount} scouting {entryCount === 1 ? 'entry' : 'entries'} stored locally
                </p>
              </div>
            </div>
            
            {/* Export Options */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" /> Export My Entries Only
              </p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <button
                  onClick={handleExportMyWord}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 active:scale-95 text-indigo-700 dark:text-indigo-400 rounded-xl font-semibold transition-all border border-indigo-200 dark:border-indigo-800"
                >
                  <FileText className="w-6 h-6" />
                  <span>Word</span>
                </button>
                <button
                  onClick={handleExportMyCSV}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 active:scale-95 text-primary-700 dark:text-primary-400 rounded-xl font-semibold transition-all border border-primary-200 dark:border-primary-800"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportMyJSON}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 active:scale-95 text-primary-700 dark:text-primary-400 rounded-xl font-semibold transition-all border border-primary-200 dark:border-primary-800"
                >
                  <FileJson className="w-6 h-6" />
                  <span>JSON</span>
                </button>
              </div>
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Export All Entries
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleExportWord}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 active:scale-95 text-indigo-700 dark:text-indigo-400 rounded-xl font-semibold transition-all border border-indigo-200 dark:border-indigo-800"
                >
                  <FileText className="w-6 h-6" />
                  <span>Word</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 active:scale-95 text-green-700 dark:text-green-400 rounded-xl font-semibold transition-all border border-green-200 dark:border-green-800"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 active:scale-95 text-blue-700 dark:text-blue-400 rounded-xl font-semibold transition-all border border-blue-200 dark:border-blue-800"
                >
                  <FileJson className="w-6 h-6" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {/* Import Option */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Import Data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 active:scale-[0.98] text-purple-700 dark:text-purple-400 rounded-xl font-semibold text-lg transition-all border border-purple-200 dark:border-purple-800"
              >
                <Upload className="w-6 h-6" />
                Import JSON File
              </button>
              {importStatus && (
                <p className={`mt-3 text-base text-center ${importStatus.includes('Successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Version</span>
              <span className="text-gray-900 dark:text-white font-medium">1.0.0 MVP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Platform</span>
              <span className="text-gray-900 dark:text-white font-medium">React Web</span>
            </div>
          </div>
        </div>

        {/* Future Features Info */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Coming Soon</h3>
              <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                <li>• Advanced analytics & team comparisons</li>
                <li>• Global leaderboards</li>
                <li>• Cloud synchronization</li>
                <li>• Enhanced data visualizations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-red-200 dark:border-red-800"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
