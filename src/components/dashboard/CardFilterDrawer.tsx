'use client';

import {
  CardElement,
  cardElementIconMap,
  cardElementOptions,
  cardIconMap,
  CardRarity,
  cardRarityOptions,
  cardSetIconMap,
  CardSetName,
  cardSetOptions,
} from '@/types/card';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { FilterOption } from './FilterOption';

interface CardFilterDrawerProps {
  open: boolean;
  onToggle: () => void;
  selectedSets: CardSetName[];
  selectedRarities: CardRarity[];
  selectedElements?: CardElement[];
  hideMissingCards?: boolean;
  onSetChange: (sets: CardSetName[]) => void;
  onRarityChange: (rarities: CardRarity[]) => void;
  onElementChange?: (elements: CardElement[]) => void;
  onHideMissingCardsChange?: (hide: boolean) => void;
}

export function CardFilterDrawer({
  open,
  onToggle,
  selectedSets,
  selectedRarities,
  selectedElements,
  hideMissingCards,
  onSetChange,
  onRarityChange,
  onElementChange,
  onHideMissingCardsChange,
}: CardFilterDrawerProps) {
  const modernSets: CardSetName[] = ['rebellion', 'conclave', 'foundation'];
  const [mode, setMode] = useState<'modern' | 'wild'>('modern');

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'modern' | 'wild' | null
  ) => {
    if (newMode !== null) {
      setMode(newMode);
      if (newMode === 'modern') {
        onSetChange(modernSets);
      } else {
        onSetChange([]);
      }
    }
  };

  const handleSetToggle = (set: CardSetName) => {
    if (selectedSets.includes(set)) {
      onSetChange(selectedSets.filter(s => s !== set));
    } else {
      onSetChange([...selectedSets, set]);
    }
  };

  const handleRarityToggle = (rarity: CardRarity) => {
    if (selectedRarities.includes(rarity)) {
      onRarityChange(selectedRarities.filter(r => r !== rarity));
    } else {
      onRarityChange([...selectedRarities, rarity]);
    }
  };

  const handleElementToggle = (element: CardElement) => {
    if (selectedElements?.includes(element)) {
      onElementChange?.(selectedElements.filter(e => e !== element));
    } else {
      onElementChange?.([...(selectedElements || []), element]);
    }
  };

  const handleReset = () => {
    onSetChange([]);
    onRarityChange([]);
    onElementChange?.([]);
  };

  const isSetSelected = (set: CardSetName) => {
    return selectedSets.includes(set);
  };

  const isRaritySelected = (rarity: CardRarity) => {
    return selectedRarities.includes(rarity);
  };

  const isElementSelected = (element: CardElement) => {
    return selectedElements?.includes(element) ?? false;
  };

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: open ? 240 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: 'auto',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                onClick={handleReset}
                disabled={selectedSets.length === 0 && selectedRarities.length === 0}
              >
                Reset
              </Button>
              <IconButton onClick={onToggle} size="small">
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          </Box>

          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Format
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              size="small"
            >
              <ToggleButton value="modern">Modern</ToggleButton>
              <ToggleButton value="wild">Wild</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <FilterOption
            title="Card Set"
            options={cardSetOptions}
            iconMap={cardSetIconMap}
            handleToggle={handleSetToggle}
            isSelected={isSetSelected}
          />

          <FilterOption
            title="Card Rarity"
            options={cardRarityOptions}
            iconMap={cardIconMap}
            handleToggle={handleRarityToggle}
            isSelected={isRaritySelected}
          />

          <FilterOption
            title="Card Element"
            options={cardElementOptions}
            iconMap={cardElementIconMap}
            handleToggle={handleElementToggle}
            isSelected={isElementSelected}
          />

          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Display Options
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box
                onClick={() => onHideMissingCardsChange?.(!hideMissingCards)}
                sx={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  bgcolor: hideMissingCards ? 'primary.main' : 'action.disabled',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'background.paper',
                    position: 'absolute',
                    top: 2,
                    left: hideMissingCards ? 22 : 2,
                    transition: 'left 0.2s',
                    boxShadow: 1,
                  }}
                />
              </Box>
              <Typography variant="body2">Hide Missing Cards</Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {!open && (
        <IconButton
          onClick={onToggle}
          sx={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            borderRadius: '0 4px 4px 0',
            zIndex: 1200,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
    </>
  );
}
