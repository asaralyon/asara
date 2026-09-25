export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { extractImage } from '@/lib/rss-image';
import { fetchSyriaOneEconomy } from '@/lib/scrape-syriaone';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: true }],
      ['content:encoded', 'content:encoded'],
      ['enclosure', 'enclosure'],
    ],
  },
  timeout: 15000,
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    },
  },
});

const ECONOMY_FEEDS = [
  { name: 'عنب بلدي', url: 'https://www.enabbaladi.net/feed' },
  { name: 'سانا', url: 'https://sana.sy/?feed=rss2' },
  { name: 'سوريا نيوز', url: 'https://syria.news/rss.php' },
];

const ECONOMY_KEYWORDS = [
  'اقتصاد', 'دولار', 'ليرة سورية', 'سعر الصرف', 'تجارة', 'استثمار',
  'المصرف المركزي', 'البنك المركزي', 'صادرات', 'واردات', 'سوق العمل',
  'تضخم', 'ميزانية', 'قطاع خاص', 'عقوبات اقتصادية', 'ناتج محلي',
];

function isEconomyItem(title: string, content: string): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return ECONOMY_KEYWORDS.some((kw) => text.includes(kw));
}

async function fetchRSSFeeds() {
  const results = await Promise.all(
    ECONOMY_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items
          .filter((item) => isEconomyItem(item.title || '', item.contentSnippet || ''))
          .slice(0, 5)
          .map((item) => ({
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            source: feed.name,
            image: extractImage(item),
          }));
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}

export async function GET() {
  try {
    const [rssItems, syriaOneItems] = await Promise.all([
      fetchRSSFeeds(),
      fetchSyriaOneEconomy(),
    ]);

    const syriaOneWithDate = syriaOneItems.map((item) => ({
      ...item,
      pubDate: new Date().toISOString(),
    }));

    const merged = [...rssItems, ...syriaOneWithDate]
      .sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0))
      .slice(0, 12);

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Economy news API error:', error);
    return NextResponse.json([]);
  }
}
