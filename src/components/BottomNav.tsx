import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Settings, PlusCircle } from 'lucide-react';

const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/analytics', icon: BarChart3, label: 'Stats' },
    { to: '/scout', icon: PlusCircle, label: 'Scout', special: true },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/80 z-50 safe-bottom shadow-lg shadow-black/5 dark:shadow-black/20 md:hidden">
      <div className="flex justify-around items-center h-20 px-1 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-all duration-200 ${
                item.special
                  ? ''
                  : isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 active:text-gray-600 dark:active:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.special ? (
                  <div className={`flex flex-col items-center justify-center -mt-5 transition-transform ${isActive ? 'scale-105' : ''}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-primary-500/40' 
                        : 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-primary-500/30 active:shadow-primary-500/50 active:scale-95'
                    }`}>
                      <item.icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    <span className={`text-xs mt-1.5 font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'active:bg-gray-100 dark:active:bg-gray-700'}`}>
                      <item.icon
                        className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
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
