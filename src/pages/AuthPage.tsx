import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ClipboardList, Cpu, Target, Trophy, Zap, Cloud, Smartphone } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, isCloudMode, authError } = useAuth();
  const navigate = useNavigate();

  // Sync auth error from context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (isCloudMode && !isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      let success: boolean;
      if (isLogin) {
        success = await login(username, password);
      } else {
        success = await register(username, password);
      }

      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-blue-500/30 animate-pulse-glow">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              FTC Scout
            </h1>
            <p className="text-lg text-blue-200">
              DECODE 2025-2026 Season
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-4 gap-2 mb-6 animate-slide-up">
            {[
              { icon: Target, label: 'Track' },
              { icon: Zap, label: 'Scout' },
              { icon: Trophy, label: 'Rank' },
              { icon: Cpu, label: 'Analyze' },
            ].map((item, i) => (
              <div key={item.label} className={`text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm stagger-${i + 1}`}>
                <item.icon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <span className="text-xs text-blue-200">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Auth Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-scale-in">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-blue-200 mb-2">
                  {isCloudMode ? 'Email' : 'Username'}
                </label>
                <input
                  id="username"
                  type={isCloudMode ? 'email' : 'text'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder={isCloudMode ? 'Enter your email' : 'Enter your username'}
                  autoComplete={isCloudMode ? 'email' : 'username'}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                  Password {isCloudMode && !isLogin && <span className="text-xs text-blue-300/70">(min 6 characters)</span>}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Enter your password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>

              {!isLogin && (
                <div className="animate-fade-in">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl animate-fade-in">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:cursor-not-allowed btn-press"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Please wait...
                  </span>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-200/70">
                {isCloudMode ? (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>☁️ Cloud sync enabled - data shared across all devices</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>🔒 Local mode - data stored on this device only</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-blue-300/50 text-sm animate-fade-in">
            <p>FTC Scouting App • FIRST Tech Challenge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
