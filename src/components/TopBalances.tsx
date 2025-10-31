import { credits_icon_url, dec_icon_url, sps_icon_url } from '@/lib/staticsIconUrls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Avatar, Box, Card, Tooltip, Typography } from '@mui/material';

interface Props {
  balances: SplBalance[];
}

const iconSize = 20;

const MyCard = ({ iconUrl, title, value }: { iconUrl: string; title: string; value: string }) => (
  <Card variant="outlined" sx={{ flex: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar src={iconUrl} sx={{ width: iconSize, height: iconSize }}>
        {title.slice(0, 2)}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Card>
);

export default function TopBalances({ balances }: Props) {
  // Extract balance values
  const credits = balances.find(b => b.token === 'CREDITS')?.balance || 0;
  const dec = balances.find(b => b.token === 'DEC')?.balance || 0;
  const decBound = balances.find(b => b.token === 'DEC-B')?.balance || 0;
  const sps = balances.find(b => b.token === 'SPS')?.balance || 0;
  const spsp = balances.find(b => b.token === 'SPSP')?.balance || 0;
  const spspIn = balances.find(b => b.token === 'SPSP-IN')?.balance || 0;
  const spspOut = balances.find(b => b.token === 'SPSP-OUT')?.balance || 0;

  // Calculate totals
  const totalDec = dec + decBound;
  const totalSps = sps + spsp;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      {/* Box 1: Credits */}
      <MyCard iconUrl={credits_icon_url} title="Credits" value={largeNumberFormat(credits)} />

      {/* Box 2: DEC Total */}
      <Tooltip
        title={
          <Box>
            <Typography variant="body2">DEC: {largeNumberFormat(dec)}</Typography>
            <Typography variant="body2">DEC-B: {largeNumberFormat(decBound)}</Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <Box sx={{ flex: 1 }}>
          <MyCard iconUrl={dec_icon_url} title="DEC" value={largeNumberFormat(totalDec)} />
        </Box>
      </Tooltip>

      {/* Box 3: SPS Total */}
      <Tooltip
        title={
          <Box>
            <Typography variant="body2">SPS Liquid: {largeNumberFormat(sps)}</Typography>
            <Typography variant="body2">SPS Staked: {largeNumberFormat(spsp)}</Typography>
            <Typography variant="body2">SPS Delegated In: {largeNumberFormat(spspIn)}</Typography>
            <Typography variant="body2">SPS Delegated Out: {largeNumberFormat(spspOut)}</Typography>
          </Box>
        }
        arrow
        placement="top"
      >
        <Box sx={{ flex: 1 }}>
          <MyCard iconUrl={sps_icon_url} title="SPS" value={largeNumberFormat(totalSps)} />
        </Box>
      </Tooltip>
    </Box>
  );
}
