import { gp_icon_url, merits_icon_url } from '@/lib/statics_icon_urls';
import { largeNumberFormat } from '@/lib/utils';
import { SplBalance } from '@/types/spl/balances';
import { Avatar, Box, Stack, Typography } from '@mui/material';

interface Props {
  balances: SplBalance[];
}

const iconSize = 20;

const MyGuild = ({
  iconUrl,
  title,
  value,
}: {
  iconUrl: string;
  title: string;
  value: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Avatar src={iconUrl} sx={{ width: iconSize, height: iconSize }}>
      {title.slice(0, 2)}
    </Avatar>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default function Guild({ balances }: Props) {
  // Extract balance values
  const merits = balances.find(b => b.token === 'MERITS')?.balance || 0;
  const gp = balances.find(b => b.token === 'GP')?.balance || 0;

  return (
    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
      <Stack>
        <Typography variant="h6" sx={{ width: '100%' }}>
          Guild
        </Typography>
        <MyGuild
          iconUrl={merits_icon_url}
          title="Merits"
          value={largeNumberFormat(merits)}
        />
        <MyGuild
          iconUrl={gp_icon_url}
          title="Guild Power"
          value={largeNumberFormat(gp)}
        />
      </Stack>
    </Box>
  );
}
