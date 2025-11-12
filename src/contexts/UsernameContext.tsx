'use client';

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

interface UsernameContextType {
  usernames: string[];
  setUsernames: (usernames: string[]) => void;
  addUsername: (username: string) => void;
  removeUsername: (username: string) => void;
  reorderUsernames: (oldIndex: number, newIndex: number) => void;
  isInitialized: boolean;
  refreshTrigger: number;
  triggerRefreshAll: () => void;
  triggerRefreshUser: (username: string) => void;
  userRefreshTriggers: Record<string, number>;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

const STORAGE_KEY = 'spl-dashboard-usernames';

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRefreshTriggers, setUserRefreshTriggers] = useState<Record<string, number>>({});
  const { logoutUser } = useAuth();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedUsernames = JSON.parse(stored);
        if (Array.isArray(parsedUsernames)) {
          setUsernamesState(parsedUsernames);
        }
      }
    } catch (error) {
      console.error('Error loading usernames from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setUsernames = (newUsernames: string[]) => {
    setUsernamesState(newUsernames);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsernames));
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
    usernames,
    setUsernames,
    addUsername,
    removeUsername,
    reorderUsernames,
    isInitialized,
    refreshTrigger,
    triggerRefreshAll,
    triggerRefreshUser,
    userRefreshTriggers,
  };

  return <UsernameContext.Provider value={value}>{children}</UsernameContext.Provider>;
};
