'use client';

import { getAllSeasons } from '@/lib/actions/getSeasonList';
import { SplSeasonInfo } from '@/types/spl/season';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface SeasonsContextType {
  seasons: SplSeasonInfo[];
  isLoading: boolean;
  /** Returns seasons (newest-first) that end after the given joinDate. */
  getSeasonsSince: (joinDate: string) => SplSeasonInfo[];
}

const SeasonsContext = createContext<SeasonsContextType | undefined>(undefined);

export function SeasonsProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<SplSeasonInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllSeasons()
      .then(setSeasons)
      .catch(err => console.error('Failed to load seasons', err))
      .finally(() => setIsLoading(false));
  }, []);

  const getSeasonsSince = useCallback(
    (joinDate: string): SplSeasonInfo[] => {
      const joinTimestamp = new Date(joinDate).getTime();
      return seasons.filter(s => new Date(s.ends).getTime() >= joinTimestamp);
    },
    [seasons]
  );

  return (
    <SeasonsContext.Provider value={{ seasons, isLoading, getSeasonsSince }}>
      {children}
    </SeasonsContext.Provider>
  );
}

export function useSeasonsContext(): SeasonsContextType {
  const ctx = useContext(SeasonsContext);
  if (!ctx) throw new Error('useSeasonsContext must be used within SeasonsProvider');
  return ctx;
}
