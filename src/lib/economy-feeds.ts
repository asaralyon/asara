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
      ['image', 'image'],
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

// ═══ ÉCONOMIE ARABE (onglet "Monde arabe") ═══
export const ARAB_ECONOMY_FEEDS: EconomyFeed[] = [
  { provider: 'Sky News Arabia', source: 'سكاي نيوز عربية — اقتصاد', url: 'https://www.skynewsarabia.com/web/rss/business.xml' },
  { provider: 'Asharq Al-Awsat', source: 'الشرق الأوسط — اقتصاد', url: 'https://aawsat.com/feed' },
  { provider: 'Al Jazeera', source: 'الجزيرة — اقتصاد', url: 'https://www.aljazeera.net/aljazeerarss/ebusiness' },
  { provider: 'BBC Arabic', source: 'BBC عربي — اقتصاد', url: 'https://feeds.bbci.co.uk/arabic/rss.xml' },
];

// ═══ SYRIE — ÉCONOMIE (onglet "Syrie") ═══
export const SYRIA_FEEDS: EconomyFeed[] = [
  { provider: 'سانا', source: 'سانا', url: 'https://www.sana.sy/?feed=rss2' },
  { provider: 'Syria Report', source: 'Syria Report', url: 'https://syria-report.com/feed' },
];

// ═══ SYRIE — POLITIQUE (futur onglet) ═══
export const SYRIA_POLITICS_FEEDS: EconomyFeed[] = [
  { provider: 'سانا', source: 'سانا', url: 'https://www.sana.sy/?feed=rss2' },
  { provider: 'Syria Report', source: 'Syria Report', url: 'https://syria-report.com/feed' },
  { provider: 'Google News', source: 'أخبار سوريا', url: 'https://news.google.com/rss/search?q=سوريا+سياسة+when:3d&hl=ar&gl=SA&ceid=SA:ar' },
  { provider: 'Google News', source: 'Syria News', url: 'https://news.google.com/rss/search?q=Syria+politics+when:3d&hl=en-US&gl=US&ceid=US:en' },
];

// ═══ ISLAMIC FINANCE (futur onglet) ═══
export const ISLAMIC_FINANCE_FEEDS: EconomyFeed[] = [
  { provider: 'Zawya', source: 'Zawya — Islamic Finance', url: 'https://news.google.com/rss/search?q=when:7d+site:zawya.com+islamic+finance&hl=en-US&gl=US&ceid=US:en' },
  { provider: 'Google News', source: 'Islamic Finance EN', url: 'https://news.google.com/rss/search?q=islamic+finance+OR+sukuk+when:7d&hl=en-US&gl=US&ceid=US:en' },
  { provider: 'Google News', source: 'التمويل الإسلامي', url: 'https://news.google.com/rss/search?q=التمويل+الإسلامي+OR+صكوك+when:7d&hl=ar&gl=AE&ceid=AE:ar' },
  { provider: 'IFG', source: 'Islamic Finance Guru', url: 'https://www.islamicfinanceguru.com/rss' },
];

// ═══ STARTUPS MENA (futur onglet) ═══
export const STARTUPS_MENA_FEEDS: EconomyFeed[] = [
  { provider: 'Wamda', source: 'Wamda', url: 'https://www.wamda.com/feed' },
  { provider: 'WAYA', source: 'WAYA Media', url: 'https://waya.media/feed' },
  { provider: 'Enterprise', source: 'Enterprise Egypt', url: 'https://enterprise.news/rss' },
  { provider: 'Arab Founders', source: 'Arab Founders', url: 'https://arabfounders.net/feed' },
  { provider: 'TechCrunch', source: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/' },
];

// ═══ MOTS-CLÉS ═══
export const ECONOMY_KEYWORDS = [
  'اقتصاد', 'اقتصادي', 'دولار', 'يورو', 'ليرة', 'سعر الصرف', 'تجارة', 'تجاري',
  'استثمار', 'استثمارات', 'المصرف', 'مصرف', 'البنك', 'بنك', 'صادرات', 'واردات',
  'سوق العمل', 'تضخم', 'ميزانية', 'قطاع خاص', 'عقوبات اقتصادية', 'ناتج محلي',
  'بورصة', 'أسهم', 'أسواق المال', 'نفط', 'بترول', 'ذهب', 'تمويل', 'استيراد',
  'تصدير', 'صناعة', 'زراعة', 'عقار', 'شركات', 'ريال', 'درهم', 'دينار',
];

export const SYRIA_KEYWORDS = [
  'سوريا','سورية','سوري','دمشق','حلب','حمص','حماة','اللاذقية','طرطوس','إدلب','ادلب',
  'دير الزور','الرقة','الحسكة','السويداء','درعا','القامشلي','الشرع','الجولاني',
  'الليرة السورية',
  'syria','syrian','damascus','aleppo','homs','latakia','idlib','deir ezzor','raqqa',
  'hasakah','sweida','daraa','qamishli','al-sharaa','sharaa','jolani','assad',
  'syrian pound',
];

// ═══ FONCTIONS UTILITAIRES ═══
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

const KNOWN_SOURCES = [
  'Reuters','رويترز','Al Arabiya','العربية','الجزيرة','Al Jazeera',
  'Bloomberg','بلومبرغ','Yahoo Finance','Arab News','Google News',
  'Asharq Al-Awsat','الشرق الأوسط','BBC Arabic','BBC عربي',
  'Sky News Arabia','سكاي نيوز عربية',
  'Wamda','WAYA','Enterprise','Arab Founders','TechCrunch',
  'Zawya','IFG','Islamic Finance Guru','Syria Report',
];

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
  requireArabic?: boolean;
  requireEconomy?: boolean;
  requireSyria?: boolean;
}

export async function fetchFeed(feed: EconomyFeed, opts: FetchOptions = {}): Promise<EconomyItem[]> {
  const {
    requireArabic = true,
    requireEconomy = true,
    requireSyria = false,
  } = opts;

  try {
    const parsed = await economyParser.parseURL(feed.url);
    const out: EconomyItem[] = [];

    for (const item of parsed.items || []) {
      try {
        const title = item.title || '';
        const desc = item.contentSnippet || item.content || '';

        if (!isUsableLink(item.link || '')) continue;
        if (requireArabic && !isArabicText(title)) continue;
        if (requireEconomy && !isEconomyItem(title, desc)) continue;
        if (requireSyria && !isAboutSyria(title, desc)) continue;

        let image: string | null = null;
        try {
          image = extractImage(item as RSSItem & Record<string, any>);
        } catch (e) {
          console.warn(`[extractImage] failed for ${feed.provider}:`, e instanceof Error ? e.message : e);
        }

        out.push({
          title: cleanTitle(title),
          link: item.link as string,
          pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
          source: feed.source,
          provider: feed.provider,
          image,
        });

        if (out.length >= 12) break;
      } catch (e) {
        console.warn(`[fetchFeed] skipped item from ${feed.provider}:`, e instanceof Error ? e.message : e);
        continue;
      }
    }

    return out;
  } catch (e) {
    console.warn(`[fetchFeed] feed ${feed.provider} failed:`, e instanceof Error ? e.message : e);
    return [];
  }
}

export async function fetchAllFeeds(feeds: EconomyFeed[], opts: FetchOptions = {}): Promise<EconomyItem[]> {
  const results = await Promise.all(feeds.map((feed) => fetchFeed(feed, opts)));
  return results.flat();
}
