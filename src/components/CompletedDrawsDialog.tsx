'use client';

import { getCompletedDraws } from '@/lib/actions/getCompletedDraws';
import { SplCompletedDraw, SplDrawEntry, SplDrawWinner } from '@/types/spl/draws';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

interface CompletedDrawsDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'frontier' | 'ranked';
  /** Usernames from the dashboard to highlight */
  dashboardUsernames: string[];
  /** An authenticated username (any one) to get player_entries */
  authorizedUsername?: string | null;
  authorizedToken?: string | null;
}

interface DrawData {
  latestDraw: SplCompletedDraw;
  entries: SplDrawEntry[];
  winners: SplDrawWinner[];
}

// â”€â”€ Draw header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DrawDetails({ draw }: { draw: SplCompletedDraw }) {
  const endDate = new Date(draw.end_date).toLocaleString();
  const blockTime = draw.verification_data
    ? new Date(draw.verification_data.block_time).toLocaleString()
    : null;

  return (
    <Box mb={1}>
      <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
        <Typography variant="h6">Draw #{draw.draw_number}</Typography>
        <Chip label={`ID: ${draw.id}`} size="small" variant="outlined" />
      </Box>
      <Table size="small" sx={{ mb: 1 }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', border: 0 }}>End Date</TableCell>
            <TableCell sx={{ border: 0 }}>{endDate}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', border: 0 }}>Total Entries</TableCell>
            <TableCell sx={{ border: 0 }}>{draw.total_entries.toLocaleString()}</TableCell>
          </TableRow>
          {draw.player_entries > 0 && (
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', border: 0 }}>Your Entries</TableCell>
              <TableCell sx={{ border: 0 }}>{draw.player_entries.toLocaleString()}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {draw.verification_data && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Verification Data
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: 0, py: 0.5 }}>Block #</TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  {draw.verification_data.block_num.toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: 0, py: 0.5 }}>Block Time</TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>{blockTime}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', border: 0, py: 0.5 }}>Trx ID</TableCell>
                <TableCell sx={{ border: 0, py: 0.5, wordBreak: 'break-all' }}>
                  <Typography variant="caption" fontFamily="monospace">
                    {draw.verification_data.trx_id}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

// â”€â”€ Winners tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WinnersTable({
  winners,
  dashboardUsernames,
}: {
  winners: SplDrawWinner[];
  dashboardUsernames: string[];
}) {
  const [search, setSearch] = useState('');
  const dashboardSet = useMemo(() => new Set(dashboardUsernames), [dashboardUsernames]);

  const filtered = useMemo(() => {
    if (!search.trim()) return winners;
    const q = search.trim().toLowerCase();
    return winners.filter(
      w => w.player.toLowerCase().includes(q)
    );
  }, [winners, search]);

  if (winners.length === 0) {
    return (
      <Typography color="text.secondary" py={2}>
        No winners data available (draw may not have verification data yet).
      </Typography>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Winners ({winners.length})
        </Typography>
        <TextField
          size="small"
          placeholder="Search playerâ€¦"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 200 }}
        />
      </Box>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Player</TableCell>
            <TableCell align="right">Entries</TableCell>
            <TableCell>Card</TableCell>
            <TableCell>UID</TableCell>
            <TableCell>Mint</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((w, idx) => {
            const isDashboard = dashboardSet.has(w.player);
            return (
              <TableRow
                key={w.prize.card_uid}
                sx={isDashboard ? { backgroundColor: 'action.selected' } : undefined}
              >
                <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {isDashboard && (
                      <Tooltip title="Your account">
                        <EmojiEventsIcon fontSize="small" color="warning" />
                      </Tooltip>
                    )}
                    {w.player}
                  </Box>
                </TableCell>
                <TableCell align="right">{w.entries.toLocaleString()}</TableCell>
                <TableCell>{w.prize.card_detail_id}</TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace">
                    {w.prize.card_uid}
                  </Typography>
                </TableCell>
                <TableCell>{w.prize.card_mint}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

// â”€â”€ Entries tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EntriesTable({
  entries,
  dashboardUsernames,
}: {
  entries: SplDrawEntry[];
  dashboardUsernames: string[];
}) {
  const [search, setSearch] = useState('');
  const dashboardSet = useMemo(() => new Set(dashboardUsernames), [dashboardUsernames]);

  const sorted = useMemo(
    () =>
      [...entries].sort((a, b) => {
        const aIs = dashboardSet.has(a.player) ? 1 : 0;
        const bIs = dashboardSet.has(b.player) ? 1 : 0;
        if (aIs !== bIs) return bIs - aIs;
        return b.entries - a.entries;
      }),
    [entries, dashboardSet]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter(e => e.player.toLowerCase().includes(q));
  }, [sorted, search]);

  const visible = filtered.slice(0, 200);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          Entries ({entries.length.toLocaleString()} players)
        </Typography>
        <TextField
          size="small"
          placeholder="Search playerâ€¦"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 200 }}
        />
      </Box>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell align="right">Entries</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map(entry => {
            const isDashboard = dashboardSet.has(entry.player);
            return (
              <TableRow
                key={entry.player}
                sx={isDashboard ? { backgroundColor: 'action.selected' } : undefined}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {isDashboard && (
                      <Tooltip title="Your account">
                        <CheckCircleOutlineIcon fontSize="small" color="success" />
                      </Tooltip>
                    )}
                    {entry.player}
                  </Box>
                </TableCell>
                <TableCell align="right">{entry.entries.toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filtered.length > 200 && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
          textAlign="center"
        >
          Showing 200 of {filtered.length.toLocaleString()} â€” use search to narrow results
        </Typography>
      )}
    </Box>
  );
}

// â”€â”€ Main dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FetchState {
  loading: boolean;
  error: string | null;
  data: DrawData | null;
}

export function CompletedDrawsDialog({
  open,
  onClose,
  type,
  dashboardUsernames,
  authorizedUsername,
  authorizedToken,
}: CompletedDrawsDialogProps) {
  const [state, setState] = useState<FetchState>({ loading: false, error: null, data: null });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const result = await getCompletedDraws(authorizedUsername, authorizedToken);
        setState({
          loading: false,
          error: null,
          data: type === 'frontier' ? result.frontier : result.ranked,
        });
      } catch (err: unknown) {
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load draw data',
          data: null,
        });
      }
    };

    fetchData();
  }, [open, type, authorizedUsername, authorizedToken]);

  const { loading, error, data } = state;
  const title = type === 'frontier' ? 'Frontier Draw Results' : 'Ranked Draw Results';

  // Check if any of the user's dashboard accounts won
  const dashboardWinners = useMemo(() => {
    if (!data?.winners) return [];
    const set = new Set(dashboardUsernames);
    return data.winners.filter(w => set.has(w.player));
  }, [data, dashboardUsernames]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">{title}</Typography>
            {dashboardWinners.length > 0 && (
              <Chip
                icon={<EmojiEventsIcon fontSize="small" />}
                label={`${dashboardWinners.length} of your accounts won!`}
                color="warning"
                size="small"
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Fetching draw data and computing winnersâ€¦
            </Typography>
          </Box>
        )}
        {error && (
          <Box p={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        {data && !loading && (
          <Box>
            <Box px={3} pt={2}>
              <DrawDetails draw={data.latestDraw} />
            </Box>
            <Divider />
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3 }}>
              <Tab label={`Winners (${data.winners.length})`} />
              <Tab label={`All Entries (${data.entries.length.toLocaleString()})`} />
            </Tabs>
            <Divider />
            <Box px={3} py={2} sx={{ overflow: 'auto', maxHeight: '50vh' }}>
              {tab === 0 && (
                <WinnersTable winners={data.winners} dashboardUsernames={dashboardUsernames} />
              )}
              {tab === 1 && (
                <EntriesTable entries={data.entries} dashboardUsernames={dashboardUsernames} />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
