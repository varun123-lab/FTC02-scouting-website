import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Top header for desktop */}
      <header className="hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-lg shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">FTC Scout</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">DECODE 2025-2026</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/scout')} className="hidden md:inline-flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-shadow shadow-sm">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Bottom navigation for mobile only */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

export default Layout;
