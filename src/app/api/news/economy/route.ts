export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';
import {
  ARAB_ECONOMY_FEEDS, fetchAllFeeds, isAboutSyria, dedupe, byDateDesc,
  type EconomyItem,
} from '@/lib/economy-feeds';
import { fetchSyriaOneEconomy } from '@/lib/scrape-syriaone';

// Rédactions syriennes — syria.news retiré (liens placeholders "-ID.html")
const SYRIA_FEEDS = [
  { provider: 'عنب بلدي', source: 'عنب بلدي', url: 'https://www.enabbaladi.net/feed' },
  { provider: 'سانا', source: 'سانا', url: 'https://www.sana.sy/?feed=rss2' },
];

const ECONOMY_KEYWORDS = [
  'اقتصاد','دولار','ليرة سورية','سعر الصرف','تجارة','استثمار','المصرف المركزي',
  'البنك المركزي','صادرات','واردات','سوق العمل','تضخم','ميزانية','قطاع خاص',
  'عقوبات اقتصادية','ناتج محلي',
];

function isEconomyItem(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return ECONOMY_KEYWORDS.some((kw) => text.includes(kw));
}

async function buildSyriaEconomy(): Promise<EconomyItem[]> {
  const [syriaFeedItems, providerItems, syriaOneItems] = await Promise.all([
    fetchAllFeeds(SYRIA_FEEDS),
    fetchAllFeeds(ARAB_ECONOMY_FEEDS),
    fetchSyriaOneEconomy(),
  ]);

  const localEconomy = syriaFeedItems.filter((i) => isEconomyItem(i.title, i.title));
  const providerAboutSyria = providerItems.filter((i) => isAboutSyria(i.title, i.title));

  const syriaOne: EconomyItem[] = (syriaOneItems as EconomyItem[]).map((item) => ({
    ...item,
    provider: item.provider || 'Syria One',
    pubDate: item.pubDate || new Date().toISOString(),
  }));

  return dedupe([...localEconomy, ...providerAboutSyria, ...syriaOne])
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