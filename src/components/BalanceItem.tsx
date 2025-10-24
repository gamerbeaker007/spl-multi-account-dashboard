import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { ReactElement } from 'react';

const iconSize = 20;

export const BalanceItem = ({
  iconUrl,
  title,
  value,
}: {
  iconUrl: string | ReactElement;
  title: string;
  value: string;
}) => {
  const renderIcon = () => {
    if (typeof iconUrl === 'string') {
      // String URL - use Avatar with src
      return (
        <Avatar src={iconUrl} sx={{ width: iconSize, height: iconSize }}>
          {title.slice(0, 2)}
        </Avatar>
      );
    } else {
      // React Icon - wrap in Avatar-styled Box
      return (
        <Box
          sx={{
            width: iconSize,
            height: iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {iconUrl}
        </Box>
      );
    }
  };

  return (
    <Tooltip title={title} arrow>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderIcon()}
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Tooltip>
  );
};
