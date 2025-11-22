'use client';

import {
  CardElement,
  CardRarity,
  cardRarityOptions,
  CardRole,
  CardSetName,
  editionMap,
  typeMap,
} from '@/types/card';
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
    rarity: number,
    color: string,
    secondaryColor: string | null,
    type: string
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
      rarity: number,
      color: string,
      secondaryColor: string | null,
      type: string
    ): boolean => {
      const rarityValue = cardRarityOptions[(rarity ?? 1) - 1];
      // Filter by card set (edition)
      if (selectedSets.length > 0) {
        // Check if any of the card's editions match the selected sets
        if (!edition || !selectedSets.includes(editionMap[edition].setName ?? '')) return false;
      }

      // Filter by rarity
      if (selectedRarities.length > 0) {
        if (!rarityValue || !selectedRarities.includes(rarityValue)) return false;
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
        if (!type || !selectedRoles.includes(typeMap[type as keyof typeof typeMap])) return false;
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
