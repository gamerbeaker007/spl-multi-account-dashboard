import { createHash } from 'crypto';
import { SplDrawEntry, SplDrawPrize, SplDrawWinner } from '@/types/spl/draws';

/**
 * Replicate the Splinterlands provably-fair draw winner selection:
 *   1. Seed = SHA-256( blockId + prevBlockId + transactionId )
 *   2. PRNG  = mulberry32 seeded from the first 4 bytes of the hash
 *   3. Loop `numWinners` times:
 *       a. Pick a random prize (uniform) and remove it from the pool
 *       b. Pick a random winner weighted by entries and remove that player
 *
 * Source: FrontierFortuneDrawVerify-*.js  (confirmed working against live data)
 */

function mulberry32(seedHex: string): () => number {
  let seed = parseInt(seedHex.slice(0, 8), 16);
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function computeDrawWinners(
  prizes: SplDrawPrize[],
  entries: SplDrawEntry[],
  verification: { block_id: string; prev_block_id: string; trx_id: string },
  prizesPerDraw: number
): SplDrawWinner[] {
  const seed = createHash('sha256')
    .update(verification.block_id + verification.prev_block_id + verification.trx_id)
    .digest('hex');

  const rng = mulberry32(seed);

  const prizePool = prizes.slice();
  const entryPool = entries.slice();

  // Cap winners: if fewer prizes than 2×limit, use actual prize count
  let numWinners = prizePool.length < prizesPerDraw * 2 ? prizePool.length : prizesPerDraw;
  let totalEntries = entryPool.reduce((s, e) => s + e.entries, 0);

  const winners: SplDrawWinner[] = [];

  while (numWinners > 0 && totalEntries > 0) {
    numWinners--;

    // Pick prize uniformly
    const prizeIdx = Math.floor(rng() * prizePool.length);
    const prize = prizePool[prizeIdx];
    prizePool.splice(prizeIdx, 1);

    // Pick winner weighted by entries
    const rand = Math.floor(rng() * totalEntries);
    let cumulative = 0;
    for (let i = 0; i < entryPool.length; i++) {
      cumulative += entryPool[i].entries;
      if (rand < cumulative && entryPool[i].entries > 0) {
        totalEntries -= entryPool[i].entries;
        const [winner] = entryPool.splice(i, 1);
        winners.push({ player: winner.player, entries: winner.entries, prize });
        break;
      }
    }
  }

  return winners;
}
