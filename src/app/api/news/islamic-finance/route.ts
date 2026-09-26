export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { ISLAMIC_FINANCE_FEEDS, fetchAllFeeds, dedupe, diversify } from '@/lib/economy-feeds';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nocache = url.searchParams.get('nocache') === '1';

    const build = async () => {
      const all = await fetchAllFeeds(ISLAMIC_FINANCE_FEEDS, {
        requireArabic: false,   // mixte AR + EN
        requireEconomy: false,  // les sources sont déjà spécialisées finance
        requireSyria: false,
      });
      const deduped = dedupe(all);
      return diversify(deduped, 3, 15);
    };

    if (nocache) {
      return NextResponse.json(await build());
    }

    const items = await getCached('news:islamic-finance-v1', build, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Islamic finance API error:', error);
    return NextResponse.json([]);
  }
}