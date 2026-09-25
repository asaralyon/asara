export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import {
  ARAB_ECONOMY_FEEDS, SYRIA_FEEDS, fetchAllFeeds, dedupe, byDateDesc,
  type EconomyItem,
} from '@/lib/economy-feeds';
import { fetchSyriaOneEconomy } from '@/lib/scrape-syriaone';

async function buildSyriaEconomy(): Promise<EconomyItem[]> {
  const [syriaLocal, providersAboutSyria, syriaOneItems] = await Promise.all([
    // Rédactions syriennes : éco + arabe, pas besoin du filtre Syrie (source = Syrie)
    fetchAllFeeds(SYRIA_FEEDS, { requireArabic: true, requireEconomy: true, requireSyria: false }),
    // Grands fournisseurs arabes : éco + arabe + mention Syrie
    fetchAllFeeds(ARAB_ECONOMY_FEEDS, { requireArabic: true, requireEconomy: true, requireSyria: true }),
    fetchSyriaOneEconomy(),
  ]);

  const syriaOne: EconomyItem[] = (syriaOneItems as EconomyItem[]).map((item) => ({
    ...item,
    provider: item.provider || 'Syria One',
    pubDate: item.pubDate || new Date().toISOString(),
  }));

  return dedupe([...syriaLocal, ...providersAboutSyria, ...syriaOne])
    .sort(byDateDesc)
    .slice(0, 18);
}

export async function GET() {
  try {
    const items = await getCached('news:economy-syria', buildSyriaEconomy, 900);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Economy news API error:', error);
    return NextResponse.json([]);
  }
}