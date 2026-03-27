'use client';

import { SeasonBalanceHistory, TokenBalanceSummary } from '@/types/spl/balanceHistory';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface Props {
  balanceHistory: SeasonBalanceHistory;
}

function formatNumber(value: number, decimals: number = 3): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function TokenRow({ summary }: { summary: TokenBalanceSummary }) {
  const [open, setOpen] = useState(false);
  const typeEntries = Object.entries(summary.byType).sort((a, b) => b[1].earned - a[1].earned);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          {typeEntries.length > 0 && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography fontWeight="bold">{summary.token}</Typography>
        </TableCell>
        <TableCell align="right" sx={{ color: 'success.main' }}>
          {formatNumber(summary.totalEarned)}
        </TableCell>
        <TableCell align="right" sx={{ color: 'error.main' }}>
          {formatNumber(summary.totalSpent)}
        </TableCell>
        <TableCell
          align="right"
          sx={{ color: summary.net >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
        >
          {formatNumber(summary.net)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Earned</TableCell>
                    <TableCell align="right">Spent</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {typeEntries.map(([type, data]) => (
                    <TableRow key={type}>
                      <TableCell>{type}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatNumber(data.earned)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatNumber(data.spent)}
                      </TableCell>
                      <TableCell align="right">{data.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function BalanceHistorySection({ balanceHistory }: Props) {
  const allSummaries = [...balanceHistory.balanceHistory, ...balanceHistory.unclaimedHistory];

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {new Date(balanceHistory.dateRange.start).toLocaleDateString()} -{' '}
        {new Date(balanceHistory.dateRange.end).toLocaleDateString()}
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40} />
              <TableCell>Token</TableCell>
              <TableCell align="right">Earned</TableCell>
              <TableCell align="right">Spent/Claimed</TableCell>
              <TableCell align="right">Net</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allSummaries.map(summary => (
              <TokenRow key={summary.token} summary={summary} />
            ))}
            {allSummaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No balance history found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
