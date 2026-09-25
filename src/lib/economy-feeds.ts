import Parser from 'rss-parser';
import type { Item as RSSItem } from 'rss-parser';
import { extractImage } from './rss-image';

export interface EconomyItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  provider: string;
  image: string | null;
}

export interface EconomyFeed {
  provider: string;
  source: string;
  url: string;
}

export const economyParser = new Parser({
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
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
});

function googleNews(query: string, hl = 'ar', gl = 'SA'): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${gl}:${hl}`;
}

export const ARAB_ECONOMY_FEEDS: EconomyFeed[] = [
  { provider: 'Bloomberg', source: 'بلومبرغ — الأسواق', url: 'https://feeds.bloomberg.com/markets/news.rss' },
  { provider: 'Bloomberg', source: 'بلومبرغ — الاقتصاد', url: 'https://feeds.bloomberg.com/economics/news.rss' },
  { provider: 'Reuters', source: 'رويترز', url: googleNews('when:7d site:reuters.com (economy OR business OR markets)', 'ar', 'SA') },
  { provider: 'Reuters', source: 'Reuters', url: googleNews('when:7d site:reuters.com (economy OR business OR markets)', 'en-US', 'US') },
  { provider: 'Al Jazeera', source: 'الجزيرة — اقتصاد', url: 'https://www.aljazeera.net/aljazeerarss/ebusiness' },
  { provider: 'Al Arabiya', source: 'العربية — أسواق', url: googleNews('when:7d site:alarabiya.net (اقتصاد OR أسواق OR استثمار)', 'ar', 'AE') },
  { provider: 'Yahoo Finance', source: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
  { provider: 'Google Finance', source: 'Google Finance', url: googleNews('when:2d (بورصة OR أسواق المال OR oil OR gold OR dollar)', 'ar', 'AE') },
  { provider: 'Arab News', source: 'Arab News', url: 'https://www.arabnews.com/rss.xml' },
];

// Mots-clés strictement syriens (durci — plus de "reconstruction" seul)
export const SYRIA_KEYWORDS = [
  'سوريا','سورية','سوري','دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','ادلب',
  'دير الزور','الرقة','الحسكة','السويداء','درعا','القامشلي','الشرع','الجولاني',
  'الليرة السورية',
  'syria','syrian','damascus','aleppo','homs','latakia','idlib','deir ezzor','raqqa',
  'hasakah','sweida','daraa','qamishli','al-sharaa','sharaa','jolani','assad',
  'syrian pound',
];

export function isAboutSyria(title = '', content = ''): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return SYRIA_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

export function isValidLink(link: string): boolean {
  try { new URL(link); return true; } catch { return false; }
}

/** Rejette les liens placeholders du type "-ID.html" (bug côté certaines sources) */
function isUsableLink(link: string): boolean {
  if (!link) return false;
  if (link.includes('-ID.html')) return false;
  return isValidLink(link);
}

const KNOWN_SOURCES = ['Reuters','رويترز','Al Arabiya','العربية','الجزيرة','Al Jazeera',
  'Bloomberg','بلومبرغ','Yahoo Finance','Arab News','Google News'];

function cleanTitle(title: string): string {
  const trimmed = title.trim();
  for (const s of KNOWN_SOURCES) {
    const suffix = ` - ${s}`;
    if (trimmed.endsWith(suffix)) return trimmed.slice(0, -suffix.length).trim();
  }
  return trimmed;
}

function normalizeKey(value: string): string {
  return value.toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function dedupe(items: EconomyItem[]): EconomyItem[] {
  const seen = new Set<string>();
  const out: EconomyItem[] = [];
  for (const item of items) {
    const titleKey = normalizeKey(item.title || '');
    const linkKey = (item.link || '').split('?')[0];
    if (!titleKey || seen.has(titleKey) || (linkKey && seen.has(linkKey))) continue;
    seen.add(titleKey);
    if (linkKey) seen.add(linkKey);
    out.push(item);
  }
  return out;
}

export function byDateDesc(a: EconomyItem, b: EconomyItem): number {
  return (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0);
}

export async function fetchFeed(feed: EconomyFeed): Promise<EconomyItem[]> {
  try {
    const parsed = await economyParser.parseURL(feed.url);
    return (parsed.items || [])
      .filter((item) => isUsableLink(item.link || ''))
      .slice(0, 12)
      .map((item) => ({
        title: cleanTitle(item.title || ''),
        link: item.link as string,
        pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
        source: feed.source,
        provider: feed.provider,
        image: extractImage(item as RSSItem & Record<string, any>),
      }));
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(feeds: EconomyFeed[]): Promise<EconomyItem[]> {
  const results = await Promise.all(feeds.map((feed) => fetchFeed(feed)));
  return results.flat();
}