export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { extractImage } from '@/lib/rss-image';

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

const ARAB_ECONOMY_FEEDS = [
  { name: 'الجزيرة اقتصاد', url: 'https://www.aljazeera.net/ebusiness/feed' },
  { name: 'العربية أسواق', url: 'https://www.alarabiya.net/aswaq/rss' },
  { name: 'بلومبرغ الشرق', url: 'https://www.business.asharq.com/rss.xml' },
];

const SYRIA_KEYWORDS = ['سوريا', 'سوري', 'دمشق', 'حلب', 'الشرع', 'إعادة الإعمار', 'العقوبات'];

function isAboutSyria(title: string, content: string): boolean {
  const text = `${title} ${content}`;
  return SYRIA_KEYWORDS.some((kw) => text.includes(kw));
}

function isValidLink(link: string): boolean {
  try {
    new URL(link);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const results = await Promise.all(
      ARAB_ECONOMY_FEEDS.map(async (feed) => {
        try {
          const parsed = await parser.parseURL(feed.url);
          return parsed.items
            .filter((item) => item.link && isValidLink(item.link) && isAboutSyria(item.title || '', item.contentSnippet || ''))
            .slice(0, 6)
            .map((item) => ({
              title: item.title || '',
              link: item.link!,
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              source: feed.name,
              image: extractImage(item),
            }));
        } catch {
          return [];
        }
      })
    );

    const merged = results
      .flat()
      .sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0))
      .slice(0, 9);

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Arab economy news API error:', error);
    return NextResponse.json([]);
  }
}
