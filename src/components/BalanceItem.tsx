import { Tooltip, Box, Avatar, Typography } from '@mui/material';
const iconSize = 20;

export const BalanceItem = ({
  iconUrl,
  title,
  value,
}: {
  iconUrl: string;
  title: string;
  value: string;
}) => (
  <Tooltip title={title} arrow>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar src={iconUrl} sx={{ width: iconSize, height: iconSize }}>
        {title.slice(0, 2)}
      </Avatar>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
);
