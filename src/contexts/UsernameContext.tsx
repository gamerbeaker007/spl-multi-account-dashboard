'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface UsernameContextType {
  usernames: string[];
  setUsernames: (usernames: string[]) => void;
  addUsername: (username: string) => void;
  removeUsername: (username: string) => void;
  reorderUsernames: (oldIndex: number, newIndex: number) => void;
  isInitialized: boolean;
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
    }
  };

  const removeUsername = (username: string) => {
    const newUsernames = usernames.filter(u => u !== username);
    setUsernames(newUsernames);
  };

  const reorderUsernames = (oldIndex: number, newIndex: number) => {
    const newUsernames = [...usernames];
    const [removed] = newUsernames.splice(oldIndex, 1);
    newUsernames.splice(newIndex, 0, removed);
    setUsernames(newUsernames);
  };

  const value: UsernameContextType = {
    usernames,
    setUsernames,
    addUsername,
    removeUsername,
    reorderUsernames,
    isInitialized,
  };

  return <UsernameContext.Provider value={value}>{children}</UsernameContext.Provider>;
};
