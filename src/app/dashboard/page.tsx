'use client';

import DashboardClient from '@/components/dashboard/DashboardClient';
import HomeIcon from '@mui/icons-material/Home';
import { Box, Container, IconButton, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <Container maxWidth={false} sx={{ px: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Tooltip title="Back to Home">
          <IconButton
            component={Link}
            href="/"
            size="medium"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" gutterBottom sx={{ mb: 0, flex: 1 }}>
          Player Dashboard
        </Typography>
      </Box>

      <DashboardClient />
    </Container>
  );
}
