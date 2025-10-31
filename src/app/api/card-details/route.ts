import { NextResponse } from 'next/server';
import { fetchCardDetails } from '@/lib/api/splApi';
import logger from '@/lib/log/logger.server';

export async function GET() {
  try {
    logger.info('Card details API route called');
    const data = await fetchCardDetails();
    logger.info(`Card details API route completed: ${data.length} cards`);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Card details API error: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to fetch card details' }, { status: 500 });
  }
}
