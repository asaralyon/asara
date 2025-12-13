export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

type CustomItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  'content:encoded'?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  'media:content'?: any;
  'media:thumbnail'?: any;
};

const parser: Parser<any, CustomItem> = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
      ['enclosure', 'enclosure'],
    ],
  },
  timeout: 10000,
});

const RSS_FEEDS = [
  {
    name: 'سوريا نيوز',
    url: 'https://syria.news/rss.php',
  },
  {
    name: 'سانا',
    url: 'https://sana.sy/?feed=rss2',
  },
  {
    name: 'عنب بلدي',
    url: 'https://www.enabbaladi.net/feed',
  },
  {
  name: 'وزارة الخارجية السورية',
  url: 'https://mfa.sy/rss'
},
];

function extractImage(item: CustomItem): string | null {
  try {
    // 1. media:content
    if (item['media:content']) {
      const media = item['media:content'];
      if (Array.isArray(media)) {
        for (const m of media) {
          const url = m?.$?.url || m?.url;
          if (url) return url;
        }
      } else {
        const url = media?.$?.url || media?.url;
        if (url) return url;
      }
    }

    // 2. media:thumbnail
    if (item['media:thumbnail']) {
      const thumb = item['media:thumbnail'];
      const url = Array.isArray(thumb) ? thumb[0]?.$?.url : thumb?.$?.url;
      if (url) return url;
    }

    // 3. enclosure
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }

    // 4. Chercher img dans content:encoded
    const content = item['content:encoded'] || item.content || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      let url = imgMatch[1];
      if (url.startsWith('//')) url = 'https:' + url;
      return url;
    }

    // 5. URL directe d'image
    const urlMatch = content.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp)/i);
    if (urlMatch) return urlMatch[0];

  } catch {
    // Ignorer
  }

  return null;
}

export async function GET() {
  try {
    const allNews: Array<{
      title: string;
      link: string;
      pubDate: string;
      source: string;
      image: string | null;
    }> = [];

    const fetchPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const result = await parser.parseURL(feed.url);
        return result.items.slice(0, 3).map((item: CustomItem) => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || item.isoDate || '',
          source: feed.name,
          image: extractImage(item),
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(items => allNews.push(...items));

    const sortedNews = allNews
      .filter(item => item.title)
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime() || 0;
        const dateB = new Date(b.pubDate).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 6);

    return NextResponse.json(sortedNews);
  } catch {
    return NextResponse.json([]);
  }
}