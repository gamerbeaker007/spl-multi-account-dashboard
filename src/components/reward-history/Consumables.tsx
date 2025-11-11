import {
  energy_icon_url,
  gold_icon_url,
  legendary_icon_url,
  merits_icon_url,
  reward_draw_major_icon_url,
  unbind_ca_c_icon_url,
  unbind_ca_e_icon_url,
  unbind_ca_l_icon_url,
  unbind_ca_r_icon_url,
} from '@/lib/staticsIconUrls';
import { Box, capitalize, Typography } from '@mui/material';
import { BalanceItem } from '../BalanceItem';

interface Props {
  title?: string;
  totalPotions?: { [potionType: string]: number };
  totalMerits?: number;
  totalEnergy?: number;
  totalScrolls?: { [scrollType: string]: number };
}

const opacity = 0.5;
const scrolColor: { [key: string]: string } = {
  common_scroll: `rgba(155, 155, 155, ${opacity})`,
  rare_scroll: `rgba(50, 95, 180, ${opacity})`,
  epic_scroll: `rgba(128, 30, 155, ${opacity})`,
  legendary_scroll: `rgba(215, 190, 55, ${opacity})`,
};

const logoMap: { [key: string]: string } = {
  gold: gold_icon_url,
  legendary: legendary_icon_url,
  merits: merits_icon_url,
  energy: energy_icon_url,
  common_scroll: unbind_ca_c_icon_url,
  rare_scroll: unbind_ca_r_icon_url,
  epic_scroll: unbind_ca_e_icon_url,
  legendary_scroll: unbind_ca_l_icon_url,
  card: reward_draw_major_icon_url,
};

export function Consumables({
  title,
  totalPotions,
  totalMerits,
  totalEnergy,
  totalScrolls,
}: Props) {
  const isEmpty =
    Object.keys(totalPotions ?? []).length === 0 &&
    totalMerits === 0 &&
    totalEnergy === 0 &&
    Object.keys(totalScrolls ?? []).length === 0;
  if (isEmpty) return null;

  return (
    <Box border={'1px solid'} borderRadius={2} p={2}>
      <Typography variant="h6">{title}</Typography>
      {totalPotions && Object.entries(totalPotions).length > 0 && (
        <Box>
          <Typography variant="subtitle1">Potions</Typography>
          {Object.entries(totalPotions).map(([type, amount]) => (
            <BalanceItem
              key={type}
              title={type === 'gold' ? 'Alchemy' : capitalize(type)}
              iconUrl={logoMap[type]}
              value={amount}
            />
          ))}
        </Box>
      )}
      {totalMerits && (
        <Box>
          <Typography variant="subtitle1">Merits</Typography>
          <BalanceItem title="Merits" iconUrl={logoMap.merits} value={totalMerits} />
        </Box>
      )}
      {totalEnergy && (
        <Box>
          <Typography variant="subtitle1">Energy</Typography>
          <BalanceItem title="Energy" iconUrl={logoMap.energy} value={totalEnergy} />
        </Box>
      )}
      {totalScrolls && Object.entries(totalScrolls).length > 0 && (
        <Box>
          <Typography variant="subtitle1">Scrolls</Typography>
          {['common_scroll', 'rare_scroll', 'epic_scroll', 'legendary_scroll'].map(type => (
            <Box key={type}>
              <BalanceItem
                title={type}
                iconUrl={logoMap[type]}
                value={totalScrolls[type] || 0}
                backgroundColor={scrolColor[type]}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
