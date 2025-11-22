'use client';

import DashboardClient from '@/components/dashboard/DashboardClient';
import HomeIcon from '@mui/icons-material/Home';
import { Box, Container, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <Container maxWidth={false} sx={{ px: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Tooltip title="Back to Home">
          <Box
            component={Link}
            href="/"
            suppressHydrationWarning
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              textDecoration: 'none',
            }}
          >
            <HomeIcon />
          </Box>
        </Tooltip>
        <Typography variant="h4" gutterBottom sx={{ mb: 0, flex: 1 }}>
          Player Dashboard
        </Typography>
      </Box>

      <DashboardClient />
    </Container>
  );
}
