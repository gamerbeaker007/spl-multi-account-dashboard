'use client';

import { CompletedDrawResult, getCompletedDrawResult } from '@/lib/actions/getCompletedDraws';
import { SplCardDetail } from '@/types/spl/cardDetails';
import { SplDrawRecentWinner } from '@/types/spl/draws';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const WEB_URL = 'https://d36mxiodymuqjm.cloudfront.net/';

const FOIL_LABEL: Record<number, string> = {
  0: 'Regular',
  1: 'Gold Foil',
  2: 'Gold Arcane',
  3: 'Black Foil',
  4: 'Black Arcane',
};

const FOIL_BORDER: Record<number, string> = {
  1: '2px solid #FFD700',
  2: '2px solid #FFD700',
  3: '2px solid #1A1A2E',
  4: '2px solid #9C27B0',
};

const FOIL_COLOR: Record<number, string> = {
  1: '#FFD700',
  2: '#FFD700',
  3: '#90CAF9',
  4: '#CE93D8',
};

function getCardImageUrl(name: string, foil: number, isLandCard = false): string {
  const suffix = foil === 1 || foil === 2 ? '_gold' : foil === 3 || foil === 4 ? '_blk' : '';
  const folder = isLandCard ? 'cards_land' : 'cards_v2.2';
  return `${WEB_URL}${folder}/${encodeURIComponent(name)}${suffix}.jpg`;
}

// ── Winner card ────────────────────────────────────────────────────────────────

function WinnerCard({
  winner,
  cardDetails,
  isOwn,
}: {
  winner: SplDrawRecentWinner;
  cardDetails: SplCardDetail[];
  isOwn: boolean;
}) {
  const cardDetail = cardDetails.find(d => d.id === winner.card_detail_id);
  const cardName = cardDetail?.name?.trim() ?? '';
  const isLandCard = cardDetail?.tier === 19;
  const imageUrl = cardName ? getCardImageUrl(cardName, winner.foil, isLandCard) : '';
  const fallbackUrl = cardName ? `${WEB_URL}cards_v2.2/${encodeURIComponent(cardName)}.jpg` : '';

  return (
    <Card
      sx={{
        width: 130,
        flexShrink: 0,
        border: isOwn
          ? '2px solid'
          : (FOIL_BORDER[winner.foil] ?? '1px solid rgba(255,255,255,0.12)'),
        opacity: cardName ? 1 : 0.5,
      }}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
        {/* Card image */}
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '260/360', mb: 0.75 }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={cardName || `Card ${winner.card_detail_id}`}
              fill
              sizes="130px"
              style={{ objectFit: 'contain' }}
              onError={e => {
                if (fallbackUrl) (e.target as HTMLImageElement).src = fallbackUrl;
              }}
              unoptimized
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'action.disabledBackground',
                borderRadius: 1,
              }}
            />
          )}
        </Box>

        {/* Foil label */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: FOIL_COLOR[winner.foil] ?? 'text.secondary',
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          {FOIL_LABEL[winner.foil] ?? `Foil ${winner.foil}`}
        </Typography>

        {/* Card name */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={cardName || `#${winner.card_detail_id}`}
        >
          {cardName || `#${winner.card_detail_id}`}
        </Typography>

        {/* Winner name */}
        <Box display="flex" alignItems="center" gap={0.25}>
          {isOwn && <EmojiEventsIcon fontSize="inherit" color="success" sx={{ flexShrink: 0 }} />}
          <Typography
            variant="caption"
            color={isOwn ? 'success.light' : 'text.secondary'}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: isOwn ? 700 : 400,
            }}
            title={winner.mint_player ?? undefined}
          >
            {winner.mint_player}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Main dialog ────────────────────────────────────────────────────────────────

interface CompletedDrawsDialogProps {
  open: boolean;
  onClose: () => void;
  type: 'frontier' | 'ranked';
  /** Usernames from the dashboard to highlight */
  dashboardUsernames: string[];
}

export function CompletedDrawsDialog({
  open,
  onClose,
  type,
  dashboardUsernames,
}: CompletedDrawsDialogProps) {
  const [data, setData] = useState<CompletedDrawResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setData(null);
    getCompletedDrawResult(type)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [open, type]);

  const title =
    type === 'frontier' ? 'Frontier Draw — Recent Results' : 'Ranked Draw — Recent Results';

  const dashboardSet = new Set(dashboardUsernames.map(u => u.toLowerCase()));

  // My accounts' entries (filtered from the full list)
  const myEntries = data
    ? data.entries
        .filter(e => dashboardSet.has(e.player.toLowerCase()))
        .sort((a, b) => b.entries - a.entries)
    : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" py={2}>
            {error}
          </Typography>
        )}

        {data && (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* ── Draw info ── */}
            <Box>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Draw #{data.latestDraw.draw_number}
                </Typography>
                <Chip label={`ID: ${data.latestDraw.id}`} size="small" variant="outlined" />
              </Box>
              <Table size="small" sx={{ width: 'auto' }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', border: 0 }}>End date</TableCell>
                    <TableCell sx={{ border: 0 }}>
                      {new Date(data.latestDraw.end_date).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', border: 0 }}>Total entries</TableCell>
                    <TableCell sx={{ border: 0 }}>
                      {data.latestDraw.total_entries.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* ── My accounts' entries ── */}
            {myEntries.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Your Entries
                </Typography>
                <Table size="small" sx={{ width: 'auto' }}>
                  <TableBody>
                    {myEntries.map(e => (
                      <TableRow key={e.player}>
                        <TableCell sx={{ border: 0 }}>{e.player}</TableCell>
                        <TableCell sx={{ border: 0, fontWeight: 'bold' }}>
                          {e.entries.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {/* ── Recent prize winners ── */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
                Your Prizes
              </Typography>
              {(() => {
                const myWinners = data.recentWinners.filter(w =>
                  dashboardSet.has((w.mint_player ?? '').toLowerCase())
                );
                return myWinners.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    None of your accounts won a prize in the latest draw.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {myWinners.map((winner, i) => (
                      <Tooltip key={`${winner.uid}-${i}`} title={`🎉 ${winner.mint_player}`}>
                        <span>
                          <WinnerCard winner={winner} cardDetails={data.cardDetails} isOwn={true} />
                        </span>
                      </Tooltip>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
