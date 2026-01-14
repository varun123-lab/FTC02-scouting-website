import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, findUser, saveUser } from '../utils/storage';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignOut, 
  onAuthChange,
  getFirebaseUserData,
  isFirebaseConfigured 
} from '../services/firebaseService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isCloudMode: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Check if Firebase is properly configured
  const isCloudMode = isFirebaseConfigured();

  useEffect(() => {
    if (isCloudMode) {
      // Firebase auth listener
      const unsubscribe = onAuthChange(async (firebaseUser) => {
        if (firebaseUser) {
          const userData = await getFirebaseUserData(firebaseUser.uid);
          if (userData) {
            setUser({
              id: userData.id,
              username: userData.username,
              createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local storage auth
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setIsLoading(false);
    }
  }, [isCloudMode]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthError(null);
    
    if (isCloudMode) {
      try {
        // For Firebase, username is actually email
        const userData = await firebaseSignIn(username, password);
        setUser({
          id: userData.id,
          username: userData.username,
          createdAt: new Date().toISOString(),
        });
        return true;
      } catch (error: any) {
        console.error('Firebase login error:', error);
        if (error.code === 'auth/user-not-found') {
          setAuthError('No account found with this email');
        } else if (error.code === 'auth/wrong-password') {
          setAuthError('Incorrect password');
        } else if (error.code === 'auth/invalid-email') {
          setAuthError('Please enter a valid email address');
        } else if (error.code === 'auth/invalid-credential') {
          setAuthError('Invalid email or password');
        } else {
          setAuthError('Login failed. Please try again.');
        }
        return false;
      }
    } else {
      // Local auth
      const foundUser = findUser(username);
      if (foundUser && foundUser.password === password) {
        setUser(foundUser);
        setCurrentUser(foundUser);
        return true;
      }
      setAuthError('Invalid username or password');
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setAuthError(null);
    
    if (isCloudMode) {
      try {
        // For Firebase, we need an email - use username as display name
        // The username field should contain an email for cloud mode
        const userData = await firebaseSignUp(username, password, username.split('@')[0]);
        setUser({
          id: userData.id,
          username: userData.username,
          createdAt: new Date().toISOString(),
        });
        return true;
      } catch (error: any) {
        console.error('Firebase register error:', error);
        if (error.code === 'auth/email-already-in-use') {
          setAuthError('An account with this email already exists');
        } else if (error.code === 'auth/weak-password') {
          setAuthError('Password should be at least 6 characters');
        } else if (error.code === 'auth/invalid-email') {
          setAuthError('Please enter a valid email address');
        } else {
          setAuthError('Registration failed. Please try again.');
        }
        return false;
      }
    } else {
      // Local auth
      const existingUser = findUser(username);
      if (existingUser) {
        setAuthError('Username already exists');
        return false;
      }

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        password,
        createdAt: new Date().toISOString(),
      };

      saveUser(newUser);
      setUser(newUser);
      setCurrentUser(newUser);
      return true;
    }
  };

  const logout = async () => {
    if (isCloudMode) {
      await firebaseSignOut();
    } else {
      setCurrentUser(null);
    }
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isCloudMode,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};;
