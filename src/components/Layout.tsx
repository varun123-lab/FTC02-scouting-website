import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

export default Layout;
