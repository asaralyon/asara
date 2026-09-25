export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { ARAB_ECONOMY_FEEDS, fetchAllFeeds, dedupe, byDateDesc } from '@/lib/economy-feeds';

export async function GET() {
  try {
    const items = await getCached(
      'news:economy-arab',
      async () => {
        const all = await fetchAllFeeds(ARAB_ECONOMY_FEEDS);
        return dedupe(all).sort(byDateDesc).slice(0, 12);
      },
      900
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error('Arab economy news API error:', error);
    return NextResponse.json([]);
  }
}