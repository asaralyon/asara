export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

type CustomItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  'content:encoded'?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  'media:content'?: any;
  'media:thumbnail'?: any;
  description?: string;
};

const parser: Parser<any, CustomItem> = new Parser({
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

const RSS_FEEDS = [
  {
    name: 'عنب بلدي',
    url: 'https://www.enabbaladi.net/feed',
  },
  {
    name: 'سانا',
    url: 'https://sana.sy/?feed=rss2',
  },
  {
    name: 'سوريا نيوز',
    url: 'https://syria.news/rss.php',
  },
];

function extractImage(item: CustomItem): string | null {
  try {
    // 1. enclosure (format standard RSS)
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
      return item.enclosure.url;
    }

    // 2. media:content
    if (item['media:content']) {
      const media = item['media:content'];
      if (Array.isArray(media)) {
        for (const m of media) {
          const url = m?.$?.url || m?.url || m;
          if (typeof url === 'string' && url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
            return url;
          }
        }
      } else {
        const url = media?.$?.url || media?.url || media;
        if (typeof url === 'string' && url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
          return url;
        }
      }
    }

    // 3. media:thumbnail
    if (item['media:thumbnail']) {
      const thumb = item['media:thumbnail'];
      if (Array.isArray(thumb)) {
        const url = thumb[0]?.$?.url || thumb[0]?.url || thumb[0];
        if (typeof url === 'string') return url;
      } else {
        const url = thumb?.$?.url || thumb?.url || thumb;
        if (typeof url === 'string') return url;
      }
    }

    // 4. Chercher img dans content:encoded ou description
    const content = item['content:encoded'] || item.content || item.description || '';

    // Pattern pour src avec guillemets simples ou doubles
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      let url = imgMatch[1];
      if (url.startsWith('//')) url = 'https:' + url;
      if (url.startsWith('http')) return url;
    }

    // 5. Pattern pour data-src (lazy loading)
    const lazySrcMatch = content.match(/data-src=["']([^"']+)["']/i);
    if (lazySrcMatch?.[1]) {
      let url = lazySrcMatch[1];
      if (url.startsWith('//')) url = 'https:' + url;
      if (url.startsWith('http')) return url;
    }

    // 6. URL directe d'image dans le contenu
    const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp))/i);
    if (urlMatch?.[1]) return urlMatch[1];

  } catch (e) {
    console.error('Error extracting image:', e);
  }

  return null;
}

// Image par défaut selon la source
function getDefaultImage(source: string): string {
  const defaults: Record<string, string> = {
    'عنب بلدي': 'https://www.enabbaladi.net/wp-content/themes/flavor-flavor-flavor/flavor/assets/images/enab-logo.png',
    'سانا': 'https://sana.sy/wp-content/uploads/2019/01/logo-sana.png',
    'سوريا نيوز': 'https://syria.news/images/logo.png',
  };
  return defaults[source] || '/images/logo.png';
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

        return result.items.slice(0, 4).map((item: CustomItem) => {
          const extractedImage = extractImage(item);

          return {
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || '',
            source: feed.name,
            image: extractedImage || getDefaultImage(feed.name),
          };
        });
      } catch (err) {
        console.error(`Error fetching ${feed.name}:`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    results.forEach((items) => allNews.push(...items));

    const sortedNews = allNews
      .filter((item) => item.title)
      .sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime() || 0;
        const dateB = new Date(b.pubDate).getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 8);

    return NextResponse.json(sortedNews);
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json([]);
  }
}
