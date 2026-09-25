export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ARAB_ECONOMY_FEEDS, fetchAllFeeds, dedupe, byDateDesc } from '@/lib/economy-feeds';

export async function GET() {
  try {
    // Étape 1 : fetchAllFeeds
    const all = await fetchAllFeeds(ARAB_ECONOMY_FEEDS, {
      requireArabic: true,
      requireEconomy: true,
      requireSyria: false,
    });

    // Étape 2 : dedupe
    const deduped = dedupe(all);

    // Étape 3 : tri
    const sorted = [...deduped].sort(byDateDesc);

    // Étape 4 : slice
    const sliced = sorted.slice(0, 12);

    return NextResponse.json({
      counts: {
        all: all.length,
        deduped: deduped.length,
        sorted: sorted.length,
        sliced: sliced.length,
      },
      sample: sliced.slice(0, 3),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message || String(error),
      stack: error?.stack,
    }, { status: 500 });
  }
}
