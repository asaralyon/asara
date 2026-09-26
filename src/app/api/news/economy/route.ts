export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import {
  ARAB_ECONOMY_FEEDS, SYRIA_FEEDS, fetchAllFeeds, dedupe, diversify,
  type EconomyItem,
} from '@/lib/economy-feeds';
import { fetchSyriaOneEconomy } from '@/lib/scrape-syriaone';

async function buildSyriaEconomy(): Promise<EconomyItem[]> {
  const [syriaLocal, providersAboutSyria, syriaOneItems] = await Promise.all([
    fetchAllFeeds(SYRIA_FEEDS, { requireArabic: true, requireEconomy: true, requireSyria: false }),
    fetchAllFeeds(ARAB_ECONOMY_FEEDS, { requireArabic: true, requireEconomy: true, requireSyria: true }),
    fetchSyriaOneEconomy(),
  ]);

  const syriaOne: EconomyItem[] = (syriaOneItems as EconomyItem[]).map((item) => ({
    ...item,
    provider: item.provider || 'Syria One',
    pubDate: item.pubDate || new Date().toISOString(),
  }));

  const all = dedupe([...syriaLocal, ...providersAboutSyria, ...syriaOne]);

  // ✅ Diversification : max 3 par source, total 18
  return diversify(all, 3, 18);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const nocache = url.searchParams.get('nocache') === '1';

    if (nocache) {
      return NextResponse.json(await buildSyriaEconomy());
    }

    const items = await getCached('news:economy-syria-v3', buildSyriaEconomy, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Economy news API error:', error);
    return NextResponse.json([]);
  }
}