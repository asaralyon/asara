export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { ARAB_ECONOMY_FEEDS, fetchAllFeeds, dedupe, diversify } from '@/lib/economy-feeds';

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
      const deduped = dedupe(all);
      // ✅ Diversification : max 3 par source, total 18
      return diversify(deduped, 3, 18);
    };

    if (nocache) {
      return NextResponse.json(await build());
    }

    const items = await getCached('news:economy-arab-v3', build, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Arab economy news API error:', error);
    return NextResponse.json([]);
  }
}