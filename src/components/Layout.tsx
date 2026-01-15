import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';
import { ClipboardList, Plus, Home, BarChart2, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pb-0 pb-20">
      {/* Top header for desktop */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-xl shadow-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">FTC Scout</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">DECODE 2025-2026</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      isActive 
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/scout')} 
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
            >
              <Plus className="w-5 h-5" /> New Entry
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {children}
      </main>

      {/* Bottom navigation for mobile only */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

export default Layout;
