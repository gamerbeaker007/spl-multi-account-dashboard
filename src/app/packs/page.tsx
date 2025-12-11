'use client';

import { useUsernameContext } from '@/contexts/UsernameContext';
import { getPlayerPackHistory, PackHistoryResult } from '@/lib/actions/getPlayerPackHistory';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const RARITY_NAMES: { [key: number]: string } = {
  1: 'Common',
  2: 'Rare',
  3: 'Epic',
  4: 'Legendary',
};

const FOIL_NAMES: { [key: number]: string } = {
  0: 'Regular',
  1: 'Gold',
  2: 'Gold Arcane',
  3: 'Black',
  4: 'Black Arcane',
};

export default function PacksPage() {
  const { usernames, isInitialized, isUserAuthenticated } = useUsernameContext();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packData, setPackData] = useState<PackHistoryResult | null>(null);

  // Set first user as default when initialized
  useEffect(() => {
    if (isInitialized && usernames.length > 0 && !selectedUser) {
      setSelectedUser(usernames[0]);
    }
  }, [isInitialized, usernames, selectedUser]);

  const handleFetch = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!isUserAuthenticated(selectedUser)) {
      setError('User is not authenticated. Please login first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getPlayerPackHistory(selectedUser, days);
      setPackData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pack history');
    } finally {
      setLoading(false);
    }
  };

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
          Card Pack Analysis
        </Typography>
      </Box>

      {/* Selection Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              label="User"
              disabled={!isInitialized || usernames.length === 0}
            >
              {usernames.map(username => (
                <MenuItem key={username} value={username}>
                  {username}
                  {!isUserAuthenticated(username) && ' (Not Authenticated)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="number"
            label="Days"
            value={days}
            onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
            sx={{ width: 120 }}
            inputProps={{ min: 1, max: 365 }}
          />

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            onClick={handleFetch}
            disabled={loading || !selectedUser || !isUserAuthenticated(selectedUser)}
          >
            Analyze Packs
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {packData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Pack Analysis Results (Period {packData.firstOpenDate && packData.lastOpenDate ? `from ${new Date(packData.firstOpenDate).toLocaleDateString()} to ${new Date(packData.lastOpenDate).toLocaleDateString()}` : ''})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Total Cards Opened: {packData.totalCards}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Total Packs Opened: {packData.editionStats.reduce((sum, ed) => sum + ed.totalPacks, 0)}
          </Typography>

          {packData.editionStats.map(edition => (
            <Box key={edition.edition} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Edition {edition.edition} (Total: {edition.totalCards} cards) (Total Packs: {edition.totalPacks})
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rarity</TableCell>
                      {[0, 1, 2, 3, 4].map(foil => (
                        <TableCell key={foil} align="right">
                          {FOIL_NAMES[foil]}
                        </TableCell>
                      ))}
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(edition.rarities)
                      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                      .map(([rarityStr, foilStats]) => {
                        const rarity = parseInt(rarityStr);
                        const total = Object.values(foilStats).reduce((sum, count) => sum + count, 0);

                        return (
                          <TableRow key={rarity}>
                            <TableCell>{RARITY_NAMES[rarity] || `Rarity ${rarity}`}</TableCell>
                            {[0, 1, 2, 3, 4].map(foil => (
                              <TableCell key={foil} align="right">
                                {foilStats[foil] || 0}
                              </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {total}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}

          {packData.editionStats.length === 0 && (
            <Typography color="text.secondary">
              No pack openings found in the last {days} days
            </Typography>
          )}
        </Paper>
      )}
    </Container>
  );
}
