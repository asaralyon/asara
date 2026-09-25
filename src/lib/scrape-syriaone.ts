import * as cheerio from 'cheerio';

export interface SyriaOneItem {
  title: string;
  link: string;
  image: string | null;
  source: string;
}

const CATEGORY_URL = 'https://syriaone.tv/category/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF'; // اقتصاد

export async function fetchSyriaOneEconomy(): Promise<SyriaOneItem[]> {
  try {
    const res = await fetch(CATEGORY_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ASARA-bot/1.0; +https://asara-lyon.fr)' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const items: SyriaOneItem[] = [];
    const seen = new Set<string>();

    $('a[href*="/article/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || seen.has(href)) return;

      let title = $(el).find('h1, h2, h3, h4').first().text().trim();
      if (!title) {
        const raw = $(el).text().trim();
        title = raw.length > 150 ? raw.slice(0, raw.length / 2).trim() : raw;
      }
      if (!title || title.length < 8) return;

      seen.add(href);
      const image = $(el).find('img').attr('src') || null;

      items.push({
        title,
        link: href.startsWith('http') ? href : `https://syriaone.tv${href}`,
        image: image && !image.startsWith('http') ? `https://syriaone.tv${image}` : image,
        source: 'سيريا ون',
      });
    });

    return items.slice(0, 8);
  } catch (error) {
    console.error('SyriaOne scrape error:', error);
    return [];
  }
}
