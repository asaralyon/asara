export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import { SYRIA_POLITICS_FEEDS, fetchAllFeeds, dedupe, diversify } from '@/lib/economy-feeds';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nocache = url.searchParams.get('nocache') === '1';

    const build = async () => {
      const all = await fetchAllFeeds(SYRIA_POLITICS_FEEDS, {
        requireArabic: false,   // mixte AR + EN
        requireEconomy: false,  // politique, pas éco
        requireSyria: false,     // ✅ filtre Syrie appliqué
      });
      const deduped = dedupe(all);
      return diversify(deduped, 3, 18);
    };

    if (nocache) {
      return NextResponse.json(await build());
    }

    const items = await getCached('news:syria-politics-v1', build, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Syria politics API error:', error);
    return NextResponse.json([]);
  }
}