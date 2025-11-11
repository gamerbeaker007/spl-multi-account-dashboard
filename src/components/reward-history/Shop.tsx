import {
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  ranked_entries_icon_url,
  reward_draw_common_icon_url,
  reward_draw_epic_icon_url,
  reward_draw_legendary_icon_url,
  reward_draw_major_icon_url,
  reward_draw_minor_icon_url,
  reward_draw_rare_icon_url,
  reward_draw_ultimate_icon_url,
} from '@/lib/staticsIconUrls';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';

interface Props {
  totalShopPurchases: {
    potions: { gold: number; legendary: number };
    scrolls: { common: number; rare: number; epic: number; legendary: number };
    merits: number;
    rankedEntries: number;
    rarityDraws: { common: number; rare: number; epic: number; legendary: number };
    chests: { minor: number; major: number; ultimate: number };
  };
}

const chestIconMap: { [key: string]: string } = {
  minor: reward_draw_minor_icon_url,
  major: reward_draw_major_icon_url,
  ultimate: reward_draw_ultimate_icon_url,
};

const rarityIconMap: { [key: string]: string } = {
  common: reward_draw_common_icon_url,
  rare: reward_draw_rare_icon_url,
  epic: reward_draw_epic_icon_url,
  legendary: reward_draw_legendary_icon_url,
};

const iconSize = 50;

export function Shop({ totalShopPurchases }: Props) {
  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Tooltip title="Results are allready included in the rest of the summary." arrow>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">Shop Purchases</Typography>
            <InfoIcon fontSize="inherit" />
          </Box>
        </Tooltip>
      </Box>

      {Object.entries(totalShopPurchases).length > 0 && (
        <Box>
          <Box border={'1px solid '} borderRadius={2} p={1} mb={1}>
            <Typography variant="body2" color="textSecondary">
              Chests
            </Typography>
            {Object.entries(totalShopPurchases.chests).map(([type, amount]) => (
              <Box key={type} justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
                {chestIconMap[type] && (
                  <Image src={chestIconMap[type]} alt={type} width={iconSize} height={iconSize} />
                )}
                <Typography variant="body2" color="textSecondary">
                  {type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {amount}x
                </Typography>
              </Box>
            ))}
          </Box>
          <Box border={'1px solid '} borderRadius={2} p={1} mb={1}>
            <Typography variant="body2" color="textSecondary">
              Rarity Draws
            </Typography>
            {Object.entries(totalShopPurchases.rarityDraws).map(([type, amount]) => (
              <Box key={type} justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
                {rarityIconMap[type] && (
                  <Image src={rarityIconMap[type]} alt={type} width={iconSize} height={iconSize} />
                )}
                <Typography variant="body2" color="textSecondary">
                  {type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {amount}x
                </Typography>
              </Box>
            ))}
          </Box>
          <Box border={'1px solid '} borderRadius={2} p={1} mb={1}>
            <Typography variant="body2" color="textSecondary">
              Others
            </Typography>

            <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              <Image src={gold_icon_url} alt={'Alchemy'} width={iconSize} height={iconSize} />
              <Typography variant="body2" color="textSecondary">
                Alchemy
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalShopPurchases.potions.gold}x
              </Typography>
            </Box>
            <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              <Image
                src={legendary_icon_url}
                alt={'Legendary'}
                width={iconSize}
                height={iconSize}
              />
              <Typography variant="body2" color="textSecondary">
                Legendary
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalShopPurchases.potions.legendary}x
              </Typography>
            </Box>

            <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              <Image src={merits_icon_url} alt={'Merits'} width={iconSize} height={iconSize} />
              <Typography variant="body2" color="textSecondary">
                Merits
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalShopPurchases.merits}x
              </Typography>
            </Box>

            <Box justifyItems={'center'} sx={{ display: 'inline-block', m: 1 }}>
              <Image
                src={ranked_entries_icon_url}
                alt={'Ranked Entries'}
                width={iconSize}
                height={iconSize}
              />
              <Typography variant="body2" color="textSecondary">
                Ranked Entries
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {totalShopPurchases.rankedEntries}x
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
