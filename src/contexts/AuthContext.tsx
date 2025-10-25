'use client';

import { useCsrfToken } from '@/hooks/useCsrf';
import { KeychainKeyTypes, KeychainSDK } from 'keychain-sdk';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthenticatedUser {
  username: string;
  encryptedToken: string;
  lastLogin: number;
  isAuthenticated: boolean;
}

interface AuthContextType {
  authenticatedUsers: AuthenticatedUser[];
  loading: boolean;
  error: string | null;
  loginUser: (username: string, timestamp?: number, signature?: string) => Promise<void>;
  logoutUser: (username: string) => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;
  isUserAuthenticated: (username: string) => boolean;
  getUserToken: (username: string) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'spl-dashboard-auth-users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getCsrfToken } = useCsrfToken();
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load authenticated users from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        if (Array.isArray(parsedUsers)) {
          setAuthenticatedUsers(parsedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading authenticated users from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign message with Keychain
  const signWithKeychain = async (username: string, message: string): Promise<string> => {
    try {
      interface HiveKeychainWindow extends Window {
        hive_keychain?: unknown;
      }
      const win = window as HiveKeychainWindow;
      if (!win || !win.hive_keychain) {
        throw new Error('Keychain extension not found');
      }
      const keychain = new KeychainSDK(win);
      const result = await keychain.signBuffer({
        username: username.toLowerCase(),
        message,
        method: KeychainKeyTypes.posting,
      });

      if (result?.success) {
        const signature = typeof result.result === 'string' ? result.result : result.message || '';

        if (!signature) {
          throw new Error('Keychain returned empty signature');
        }

        return signature;
      } else {
        throw new Error('Keychain signature was rejected or failed');
      }
    } catch (err) {
      let errorMessage = 'Unknown Keychain error occurred';

      if (err instanceof Error) {
        errorMessage = `Keychain error: ${err.message}`;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = `Keychain error: ${err.message}`;
      }

      //Shut i log this?
      // console.error('Keychain signing error:', err);
      throw new Error(errorMessage);
    }
  };

  // Login function for a specific user
  const loginUser = async (username: string, timestamp?: number, signature?: string) => {
    try {
      setError(null);

      // Fetch CSRF token when needed (lazy loading)
      const csrfToken = await getCsrfToken();

      const finalTimestamp = timestamp || Date.now();
      const message = `${username.toLowerCase()}${finalTimestamp}`;

      // Get signature if not provided
      const finalSignature = signature || (await signWithKeychain(username, message));

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          username: username.toLowerCase(),
          timestamp: finalTimestamp,
          signature: finalSignature,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || `Login failed with status: ${response.status}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Get the encrypted token from response
      const loginData = await response.json();
      if (!loginData.token) {
        throw new Error('No encrypted token received from server');
      }

      // Add or update user in authenticated users list
      const newUser: AuthenticatedUser = {
        username: username.toLowerCase(),
        encryptedToken: loginData.token,
        lastLogin: Date.now(),
        isAuthenticated: true,
      };

      // Use functional update to ensure we have the latest state
      setAuthenticatedUsers(currentUsers => {
        const updatedUsers = currentUsers.filter(u => u.username !== username.toLowerCase());
        updatedUsers.push(newUser);

        // Also update localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
        } catch (error) {
          console.error('Error saving authenticated users to localStorage:', error);
        }

        return updatedUsers;
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err; // Re-throw API errors
      } else {
        const errorMsg = 'Network error during login';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  // Logout function for a specific user
  const logoutUser = async (username: string) => {
    try {
      setError(null);

      // Use functional update to ensure we have the latest state
      setAuthenticatedUsers(currentUsers => {
        const updatedUsers = currentUsers.filter(u => u.username !== username.toLowerCase());

        // Also update localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
        } catch (error) {
          console.error('Error saving authenticated users to localStorage:', error);
        }

        return updatedUsers;
      });
    } catch (error) {
      const errorMsg = 'Logout error';
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  };

  // Logout all users
  const logoutAll = async () => {
    try {
      setError(null);

      // Clear all authenticated users
      setAuthenticatedUsers([]);

      // Also clear localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      } catch (error) {
        console.error('Error clearing authenticated users from localStorage:', error);
      }
    } catch (error) {
      const errorMsg = 'Logout all error';
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  };

  // Check if a specific user is authenticated
  const isUserAuthenticated = (username: string): boolean => {
    return authenticatedUsers.some(u => u.username === username.toLowerCase() && u.isAuthenticated);
  };

  // Get encrypted token for a specific user
  const getUserToken = (username: string): string | null => {
    const user = authenticatedUsers.find(u => u.username === username.toLowerCase());
    return user?.encryptedToken || null;
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    authenticatedUsers,
    loading,
    error,
    loginUser,
    logoutUser,
    logoutAll,
    clearError,
    isUserAuthenticated,
    getUserToken,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
