import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Moon, Sun, User, Database, Info, Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportDataAsJSON, exportDataAsCSV, importDataFromJSON, getScoutingEntries } from '../utils/storage';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scout Account</p>
            </div>
          </div>
        </div>

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
          <div className="px-6 py-4 space-y-4">
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
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Data
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium transition-colors border border-green-200 dark:border-green-800"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium transition-colors border border-blue-200 dark:border-blue-800"
                >
                  <FileJson className="w-5 h-5" />
                  JSON
                </button>
              </div>
            </div>

            {/* Import Option */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Import Data
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium transition-colors border border-purple-200 dark:border-purple-800"
              >
                <Upload className="w-5 h-5" />
                Import JSON File
              </button>
              {importStatus && (
                <p className={`mt-2 text-sm text-center ${importStatus.includes('Successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
