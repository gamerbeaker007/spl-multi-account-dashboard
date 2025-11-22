import { CardElement, CardRarity, CardRole, CardSetName } from '@/types/card';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  title: string;
  options: CardSetName[] | CardRarity[] | CardElement[] | CardRole[];
  iconMap: Record<CardSetName | CardRarity | CardElement | CardRole, string>;
  handleToggle: (option: CardSetName | CardRarity | CardElement | CardRole) => void;
  isSelected: (set: CardSetName | CardRarity | CardElement | CardRole) => boolean;
}

const iconSize = 25;
// Define props here
export const FilterOption = ({ title, options, iconMap, handleToggle, isSelected }: Props) => {
  return (
    <Box mb={3}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        {options.map(v => (
          <Box
            key={v}
            onClick={() => handleToggle(v)}
            sx={{
              cursor: 'pointer',
              border: 2,
              borderColor: isSelected(v) ? 'secondary.main' : 'transparent',
              borderRadius: 1,
              p: 0.5,
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: isSelected(v) ? 'secondary.light' : 'action.hover',
              },
            }}
          >
            <Image
              src={iconMap[v]}
              alt={v}
              width={iconSize}
              height={iconSize}
              title={v.charAt(0).toUpperCase() + v.slice(1)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
