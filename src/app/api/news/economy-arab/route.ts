export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { ARAB_ECONOMY_FEEDS, fetchAllFeeds, dedupe, byDateDesc } from '@/lib/economy-feeds';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nocache = url.searchParams.get('nocache') === '1';

    const build = async () => {
      const all = await fetchAllFeeds(ARAB_ECONOMY_FEEDS, {
        requireArabic: true,
        requireEconomy: true,
        requireSyria: false,
      });
      return dedupe(all).sort(byDateDesc).slice(0, 12);
    };

    if (nocache) {
      const items = await build();
      return NextResponse.json(items);
    }

    const items = await getCached('news:economy-arab-v2', build, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Arab economy news API error:', error);
    return NextResponse.json([]);
  }
}