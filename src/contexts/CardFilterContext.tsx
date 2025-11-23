'use client';

import { CardElement, CardRarity, CardRole, CardSetName, editionMap } from '@/types/card';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface CardFilterContextType {
  // Filter states
  selectedSets: CardSetName[];
  selectedRarities: CardRarity[];
  selectedElements: CardElement[];
  selectedRoles: CardRole[];
  drawerOpen: boolean;
  hideMissingCards: boolean;

  // Actions
  setSelectedSets: (sets: CardSetName[]) => void;
  setSelectedRarities: (rarities: CardRarity[]) => void;
  setSelectedElements: (elements: CardElement[]) => void;
  setSelectedRoles: (roles: CardRole[]) => void;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  setHideMissingCards: (hide: boolean) => void;

  // Filtering
  filterCard: (
    edition: number,
    rarity: CardRarity,
    color: CardElement,
    secondaryColor: CardElement | undefined,
    role: CardRole
  ) => boolean;
}

const CardFilterContext = createContext<CardFilterContextType | undefined>(undefined);

export const useCardFilter = () => {
  const context = useContext(CardFilterContext);
  if (!context) {
    throw new Error('useCardFilter must be used within a CardFilterProvider');
  }
  return context;
};

interface CardFilterProviderProps {
  children: ReactNode;
}

export const CardFilterProvider: React.FC<CardFilterProviderProps> = ({ children }) => {
  const modernSets: CardSetName[] = ['rebellion', 'conclave', 'foundation'];

  const [selectedSets, setSelectedSets] = useState<CardSetName[]>(modernSets);
  const [selectedRarities, setSelectedRarities] = useState<CardRarity[]>([]);
  const [selectedElements, setSelectedElements] = useState<CardElement[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<CardRole[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [hideMissingCards, setHideMissingCards] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  const filterCard = useCallback(
    (
      edition: number,
      rarity: CardRarity,
      color: CardElement,
      secondaryColor: CardElement | undefined,
      role: CardRole
    ): boolean => {
      // Filter by card set (edition)
      if (selectedSets.length > 0) {
        // Check if any of the card's editions match the selected sets
        if (!selectedSets.includes(editionMap[edition].setName ?? '')) return false;
      }

      // Filter by rarity
      if (selectedRarities.length > 0) {
        if (!rarity || !selectedRarities.includes(rarity)) return false;
      }

      // Filter by element
      if (selectedElements.length > 0) {
        if (!color) return false;
        const hasMatchingElement = selectedElements.some(
          element => element === color || element === secondaryColor
        );
        if (!hasMatchingElement) return false;
      }

      // Filter by role
      if (selectedRoles.length > 0) {
        if (!role || !selectedRoles.includes(role)) return false;
      }

      return true;
    },
    [selectedSets, selectedRarities, selectedElements, selectedRoles]
  );

  const value: CardFilterContextType = {
    selectedSets,
    selectedRarities,
    selectedElements,
    selectedRoles,
    drawerOpen,
    hideMissingCards,
    setSelectedSets,
    setSelectedRarities,
    setSelectedElements,
    setSelectedRoles,
    setDrawerOpen,
    toggleDrawer,
    setHideMissingCards,
    filterCard,
  };

  return <CardFilterContext.Provider value={value}>{children}</CardFilterContext.Provider>;
};
