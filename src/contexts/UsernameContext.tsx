'use client';

import { loginWithSignature } from '@/lib/actions/login';
import { KeychainKeyTypes, KeychainSDK } from 'keychain-sdk';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

// Hive/Splinterlands username rules: 3-16 chars, starts with a letter,
// only letters, numbers, dots, hyphens and underscores — no spaces.
const isValidSplUsername = (username: string): boolean =>
  /^[a-zA-Z][a-zA-Z0-9._-]{2,15}$/.test(username);

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

  // useRef for mounted guard — stable across renders, React Compiler-safe
  const mountedRef = useRef(true);

  // Initialize: read localStorage synchronously, then kick off async token validation.
  // setIsInitialized(true) is called directly in the flat effect body so no nested
  // try/finally or mutable `let` variables can prevent it from running.
  useEffect(() => {
    mountedRef.current = true;

    // ── 1. Load usernames ────────────────────────────────────────────────────
    try {
      const raw = localStorage.getItem(USERNAMES_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = (parsed as unknown[]).filter(
            (u): u is string => typeof u === 'string' && isValidSplUsername(u)
          );
          if (valid.length !== parsed.length) {
            console.warn(
              `[UsernameContext] Removed ${parsed.length - valid.length} invalid username(s) from storage`
            );
            localStorage.setItem(USERNAMES_STORAGE_KEY, JSON.stringify(valid));
          }
          setUsernamesState(valid);
        } else {
          console.warn('[UsernameContext] Stored usernames is not an array, discarding');
          localStorage.removeItem(USERNAMES_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('[UsernameContext] failed to load usernames from localStorage:', err);
      localStorage.removeItem(USERNAMES_STORAGE_KEY);
    }

    // ── 2. Load auth users ───────────────────────────────────────────────────
    let rawAuth: AuthenticatedUser[] = [];
    try {
      const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authRaw) {
        const parsed: unknown = JSON.parse(authRaw);
        if (Array.isArray(parsed)) {
          rawAuth = parsed as AuthenticatedUser[];
          setAuthenticatedUsers(rawAuth);
        } else {
          console.warn('[UsernameContext] Stored auth is not an array, discarding');
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('[UsernameContext] failed to load auth from localStorage:', err);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    // ── 3. Mark initialized ──────────────────────────────────────────────────
    // This runs synchronously — nothing above is async — so it is guaranteed
    // to execute before the effect returns.
    setIsInitialized(true);

    // ── 4. Background: validate stored tokens ────────────────────────────────
    if (rawAuth.length > 0) {
      validateStoredTokens(rawAuth)
        .then(validatedUsers => {
          if (!mountedRef.current) return;
          setAuthenticatedUsers(validatedUsers);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(validatedUsers));
          } catch (err) {
            console.error('[UsernameContext] failed to save validated auth:', err);
          }
        })
        .catch(err => {
          console.error('[UsernameContext] token validation error:', err);
          if (!mountedRef.current) return;
          setAuthenticatedUsers([]);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        });
    }

    return () => {
      mountedRef.current = false;
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
    const normalized = username.trim().toLowerCase();
    if (!isValidSplUsername(normalized)) {
      console.warn(`[UsernameContext] Rejected invalid username: "${username}"`);
      return;
    }
    if (!usernames.includes(normalized)) {
      const newUsernames = [...usernames, normalized];
      setUsernames(newUsernames);
      // Trigger fetch for the newly added user
      setUserRefreshTriggers(prev => ({
        ...prev,
        [normalized]: (prev[normalized] || 0) + 1,
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
