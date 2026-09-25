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
      ['image', 'image'],           // ← AJOUT (non-standard, syria.news & co)
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

// ✅ Uniquement des sources ARABES
export const ARAB_ECONOMY_FEEDS: EconomyFeed[] = [
  { provider: 'Reuters', source: 'رويترز', url: googleNews('when:7d site:reuters.com (اقتصاد OR أسواق OR استثمار)', 'ar', 'SA') },
  { provider: 'Al Jazeera', source: 'الجزيرة — اقتصاد', url: 'https://www.aljazeera.net/aljazeerarss/ebusiness' },
  { provider: 'Al Arabiya', source: 'العربية — أسواق', url: googleNews('when:7d site:alarabiya.net (اقتصاد OR أسواق OR استثمار)', 'ar', 'AE') },
  { provider: 'Google Finance', source: 'Google Finance', url: googleNews('when:2d (بورصة OR أسواق المال OR اقتصاد OR استثمار)', 'ar', 'AE') },
];

// Rédactions syriennes — syria.news retiré (liens cassés -ID.html)
export const SYRIA_FEEDS: EconomyFeed[] = [
  { provider: 'عنب بلدي', source: 'عنب بلدي', url: 'https://www.enabbaladi.net/feed' },
  { provider: 'سانا', source: 'سانا', url: 'https://www.sana.sy/?feed=rss2' },
];

// ✅ Mots-clés économiques (élargis mais pas génériques)
export const ECONOMY_KEYWORDS = [
  'اقتصاد', 'اقتصادي', 'دولار', 'يورو', 'ليرة', 'سعر الصرف', 'تجارة', 'تجاري',
  'استثمار', 'استثمارات', 'المصرف', 'مصرف', 'البنك', 'بنك', 'صادرات', 'واردات',
  'سوق العمل', 'تضخم', 'ميزانية', 'قطاع خاص', 'عقوبات اقتصادية', 'ناتج محلي',
  'بورصة', 'أسهم', 'أسواق المال', 'نفط', 'بترول', 'ذهب', 'تمويل', 'استيراد',
  'تصدير', 'صناعة', 'زراعة', 'عقار', 'شركات', 'ريال', 'درهم', 'دينار',
];

// ✅ Mots-clés strictement syriens
export const SYRIA_KEYWORDS = [
  'سوريا','سورية','سوري','دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','ادلب',
  'دير الزور','الرقة','الحسكة','السويداء','درعا','القامشلي','الشرع','الجولاني',
  'الليرة السورية',
  'syria','syrian','damascus','aleppo','homs','latakia','idlib','deir ezzor','raqqa',
  'hasakah','sweida','daraa','qamishli','al-sharaa','sharaa','jolani','assad',
  'syrian pound',
];

// ✅ Détection arabe (rejette les items anglais si le flux en mélange)
const ARABIC_RE = /[\u0600-\u06FF]/;
export function isArabicText(text: string): boolean {
  return ARABIC_RE.test(text || '');
}

export function isEconomyItem(title = '', content = ''): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return ECONOMY_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

export function isAboutSyria(title = '', content = ''): boolean {
  const text = `${title} ${content}`.toLowerCase();
  return SYRIA_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

export function isValidLink(link: string): boolean {
  try { new URL(link); return true; } catch { return false; }
}

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

interface FetchOptions {
  requireArabic?: boolean;   // défaut: true
  requireEconomy?: boolean;  // défaut: true
  requireSyria?: boolean;    // défaut: false
}

export async function fetchFeed(feed: EconomyFeed, opts: FetchOptions = {}): Promise<EconomyItem[]> {
  const {
    requireArabic = true,
    requireEconomy = true,
    requireSyria = false,
  } = opts;

  try {
    const parsed = await economyParser.parseURL(feed.url);
    return (parsed.items || [])
      .filter((item) => {
        const title = item.title || '';
        const desc = item.contentSnippet || item.content || '';
        if (!isUsableLink(item.link || '')) return false;
        if (requireArabic && !isArabicText(title)) return false;
        if (requireEconomy && !isEconomyItem(title, desc)) return false;
        if (requireSyria && !isAboutSyria(title, desc)) return false;
        return true;
      })
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

export async function fetchAllFeeds(feeds: EconomyFeed[], opts: FetchOptions = {}): Promise<EconomyItem[]> {
  const results = await Promise.all(feeds.map((feed) => fetchFeed(feed, opts)));
  return results.flat();
}