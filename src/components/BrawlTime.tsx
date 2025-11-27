'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
  startDate: string;
  status: number;
}

const parseRemaining = (ms: number) => {
  if (ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);

  return { days, hours, minutes, seconds };
};

export default function BrawlTime({ startDate, status }: Props) {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const endDateExtraTime = status === 1 ? 2 * 24 * 60 * 60 * 1000 : 0; // add 2 days if status is In Progress
  const endDate = startDate
    ? new Date(new Date(startDate).getTime() + endDateExtraTime) // add two days for the end date
    : null;
  const timeRemaining = endDate ? endDate.getTime() - currentTime : 0;
  const { days, hours, minutes, seconds } = parseRemaining(timeRemaining);

  const text = status === 0 ? 'Brawl starts in' : status === 1 ? 'Brawl ends in' : null;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <Box mt={1} sx={{ fontFamily: 'monospace' }}>
      {text && (
        <Typography variant="body2" fontSize={10}>
          {text}
        </Typography>
      )}
      <Grid container spacing={0.5} justifyContent="left">
        <Grid>
          <Typography variant="body1">{pad(days)}</Typography>
          <Typography variant="caption">DAYS</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">:</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">{pad(hours)}</Typography>
          <Typography variant="caption">HRS</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">:</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">{pad(minutes)}</Typography>
          <Typography variant="caption">MIN</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">:</Typography>
        </Grid>

        <Grid>
          <Typography variant="body1">{pad(seconds)}</Typography>
          <Typography variant="caption">SEC</Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
