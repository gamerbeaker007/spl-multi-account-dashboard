'use client';

import { loginWithSignature } from '@/lib/actions/login';
import { KeychainKeyTypes, KeychainSDK } from 'keychain-sdk';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthenticatedUser {
  username: string;
  encryptedToken: string;
  lastLogin: number;
  isAuthenticated: boolean;
}

interface UsernameContextType {
  // Username management
  usernames: string[];
  setUsernames: (usernames: string[]) => void;
  addUsername: (username: string) => void;
  removeUsername: (username: string) => void;
  reorderUsernames: (oldIndex: number, newIndex: number) => void;

  // Authentication
  authenticatedUsers: AuthenticatedUser[];
  loginUser: (username: string, timestamp?: number, signature?: string) => Promise<void>;
  logoutUser: (username: string) => Promise<void>;
  logoutAll: () => Promise<void>;
  isUserAuthenticated: (username: string) => boolean;
  getUserToken: (username: string) => string | null;

  // State
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;

  // Refresh triggers
  refreshTrigger: number;
  triggerRefreshAll: () => void;
  triggerRefreshUser: (username: string) => void;
  userRefreshTriggers: Record<string, number>;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

const USERNAMES_STORAGE_KEY = 'spl-dashboard-usernames';
const AUTH_STORAGE_KEY = 'spl-dashboard-auth-users';

export const useUsernameContext = () => {
  const context = useContext(UsernameContext);
  if (!context) {
    throw new Error('useUsernameContext must be used within a UsernameProvider');
  }
  return context;
};

interface UsernameProviderProps {
  children: ReactNode;
}

export const UsernameProvider: React.FC<UsernameProviderProps> = ({ children }) => {
  const [usernames, setUsernamesState] = useState<string[]>([]);
  const [authenticatedUsers, setAuthenticatedUsers] = useState<AuthenticatedUser[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRefreshTriggers, setUserRefreshTriggers] = useState<Record<string, number>>({});

  // Initialize: Load usernames and auth users, validate tokens
  useEffect(() => {
    let mounted = true;
    let initialized = false;

    const initializeContext = async () => {
      // Timeout fallback to prevent stuck loading
      const timeoutId = setTimeout(() => {
        if (mounted && !initialized) {
          console.warn('UsernameContext initialization timeout - forcing initialized state');
          if (mounted) setIsInitialized(true);
        }
      }, 2000); // Increased to 2 seconds to allow for slow network/validation

      try {
        // Load usernames
        const storedUsernames = localStorage.getItem(USERNAMES_STORAGE_KEY);
        if (storedUsernames) {
          const parsedUsernames = JSON.parse(storedUsernames);
          if (Array.isArray(parsedUsernames) && mounted) {
            setUsernamesState(parsedUsernames);
          }
        }

        // Load authenticated users
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (Array.isArray(parsedAuth) && mounted) {
            // Load auth users immediately without validation to prevent hanging
            setAuthenticatedUsers(parsedAuth);

            // Validate tokens asynchronously in the background (don't await)
            validateStoredTokens(parsedAuth)
              .then(validatedUsers => {
                if (mounted) {
                  setAuthenticatedUsers(validatedUsers);
                  // Update localStorage with validated users (removes invalid tokens)
                  try {
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(validatedUsers));
                  } catch (error) {
                    console.error(
                      '[UsernameContext] Error saving validated auth users to localStorage:',
                      error
                    );
                  }
                }
              })
              .catch(error => {
                console.error('[UsernameContext] Error validating tokens:', error);
              });
          }
        }
      } catch (error) {
        console.error('[UsernameContext] Error loading data from localStorage:', error);
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          initialized = true;
          setIsInitialized(true);
        }
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeContext();
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Validate stored tokens (check if expired)
  const validateStoredTokens = async (users: AuthenticatedUser[]): Promise<AuthenticatedUser[]> => {
    const validatedUsers: AuthenticatedUser[] = [];

    for (const user of users) {
      try {
        // Import validation function
        const { validateEncryptedToken } = await import('@/lib/actions/validateToken');
        const validationResult = await validateEncryptedToken(user.encryptedToken);

        if (validationResult.valid) {
          // Token is still valid
          validatedUsers.push(user);
        } else {
          // Token is invalid/expired - log it out
          console.warn(`Token expired for user: ${user.username}`);
        }
      } catch (error) {
        console.error(`Error validating token for ${user.username}:`, error);
        // If validation fails, remove the user
      }
    }

    return validatedUsers;
  };

  // Username management functions
  const setUsernames = (newUsernames: string[]) => {
    setUsernamesState(newUsernames);
    try {
      localStorage.setItem(USERNAMES_STORAGE_KEY, JSON.stringify(newUsernames));
    } catch (error) {
      console.error('Error saving usernames to localStorage:', error);
    }
  };

  const addUsername = (username: string) => {
    if (!usernames.includes(username)) {
      const newUsernames = [...usernames, username];
      setUsernames(newUsernames);
      // Trigger fetch for the newly added user
      setUserRefreshTriggers(prev => ({
        ...prev,
        [username]: (prev[username] || 0) + 1,
      }));
    }
  };

  const removeUsername = (username: string) => {
    const newUsernames = usernames.filter(u => u !== username);
    setUsernames(newUsernames);
    logoutUser(username);
    // Clean up the trigger for removed user
    setUserRefreshTriggers(prev => {
      const newTriggers = { ...prev };
      delete newTriggers[username];
      return newTriggers;
    });
  };

  const reorderUsernames = (oldIndex: number, newIndex: number) => {
    const newUsernames = [...usernames];
    const [removed] = newUsernames.splice(oldIndex, 1);
    newUsernames.splice(newIndex, 0, removed);
    setUsernames(newUsernames);
  };

  // Authentication functions
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

      throw new Error(errorMessage);
    }
  };

  const loginUser = async (username: string, timestamp?: number, signature?: string) => {
    try {
      setError(null);
      setLoading(true);

      const finalTimestamp = timestamp || Date.now();
      const message = `${username.toLowerCase()}${finalTimestamp}`;

      // Get signature if not provided
      const finalSignature = signature || (await signWithKeychain(username, message));

      // Call server action for login
      const loginData = await loginWithSignature(
        username.toLowerCase(),
        finalTimestamp,
        finalSignature
      );

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
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUsers));
        } catch (error) {
          console.error('Error saving authenticated users to localStorage:', error);
        }

        return updatedUsers;
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        const errorMsg = 'Network error during login';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async (username: string) => {
    try {
      setError(null);

      // Use functional update to ensure we have the latest state
      setAuthenticatedUsers(currentUsers => {
        const updatedUsers = currentUsers.filter(u => u.username !== username.toLowerCase());

        // Also update localStorage
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUsers));
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

  const logoutAll = async () => {
    try {
      setError(null);

      // Clear all authenticated users
      setAuthenticatedUsers([]);

      // Also clear localStorage
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([]));
      } catch (error) {
        console.error('Error clearing authenticated users from localStorage:', error);
      }
    } catch (error) {
      const errorMsg = 'Logout all error';
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  };

  const isUserAuthenticated = (username: string): boolean => {
    return authenticatedUsers.some(u => u.username === username.toLowerCase() && u.isAuthenticated);
  };

  const getUserToken = (username: string): string | null => {
    const user = authenticatedUsers.find(u => u.username === username.toLowerCase());
    return user?.encryptedToken || null;
  };

  const clearError = () => {
    setError(null);
  };

  // Refresh triggers
  const triggerRefreshAll = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const triggerRefreshUser = useCallback((username: string) => {
    setUserRefreshTriggers(prev => ({
      ...prev,
      [username]: (prev[username] || 0) + 1,
    }));
  }, []);

  const value: UsernameContextType = {
    // Username management
    usernames,
    setUsernames,
    addUsername,
    removeUsername,
    reorderUsernames,

    // Authentication
    authenticatedUsers,
    loginUser,
    logoutUser,
    logoutAll,
    isUserAuthenticated,
    getUserToken,

    // State
    isInitialized,
    loading,
    error,
    clearError,

    // Refresh triggers
    refreshTrigger,
    triggerRefreshAll,
    triggerRefreshUser,
    userRefreshTriggers,
  };

  return <UsernameContext.Provider value={value}>{children}</UsernameContext.Provider>;
};
