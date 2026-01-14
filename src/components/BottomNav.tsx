import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Settings, PlusCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/scout', icon: PlusCircle, label: 'Scout', special: true },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/80 z-50 safe-bottom shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full px-2 transition-all duration-200 ${
                item.special
                  ? ''
                  : isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.special ? (
                  <div className={`flex flex-col items-center justify-center -mt-4 transition-transform ${isActive ? 'scale-105' : ''}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-500/40' 
                        : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30 hover:shadow-primary-500/50'
                    }`}>
                      <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                    <span className={`text-xs mt-1 font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
                      <item.icon
                        className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
