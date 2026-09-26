export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { STARTUPS_MENA_FEEDS, fetchAllFeeds, dedupe, diversify } from '@/lib/economy-feeds';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nocache = url.searchParams.get('nocache') === '1';

    const build = async () => {
      const all = await fetchAllFeeds(STARTUPS_MENA_FEEDS, {
        requireArabic: false,   // mixte AR + EN
        requireEconomy: false,  // déjà spécialisé startups
        requireSyria: false,
      });
      const deduped = dedupe(all);
      // ✅ 10 providers × max 3 = 18 articles diversifiés
      return diversify(deduped, 3, 18);
    };

    if (nocache) {
      return NextResponse.json(await build());
    }

    const items = await getCached('news:startups-mena-v1', build, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Startups MENA API error:', error);
    return NextResponse.json([]);
  }
}