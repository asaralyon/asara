import type { Item as RSSItem } from 'rss-parser';

type AnyItem = RSSItem & Record<string, any>;

function pickUrl(node: any): string | null {
  if (!node) return null;
  if (typeof node === 'string' && node.startsWith('http')) return node;
  if (Array.isArray(node)) {
    for (const n of node) {
      const u = pickUrl(n);
      if (u) return u;
    }
    return null;
  }
  if (node.$?.url) return node.$.url;
  if (node.url) return node.url;
  return null;
}

function extractFromHtml(html: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m && m[1]?.startsWith('http')) return m[1];
  return null;
}

export function extractImage(item: AnyItem): string | null {
  // 1. media:content
  const mc = pickUrl(item['media:content']);
  if (mc) return mc;

  // 2. media:thumbnail
  const mt = pickUrl(item['media:thumbnail']);
  if (mt) return mt;

  // 3. <image> (champ custom non-standard, utilisé par syria.news etc.)
  const img = pickUrl(item.image);
  if (img) return img;

  // 4. enclosure (image/)
  if (item.enclosure?.url && typeof item.enclosure.type === 'string' && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // 5. content:encoded
  const fromContent = extractFromHtml(item['content:encoded'] || '');
  if (fromContent) return fromContent;

  // 6. description / contentSnippet
  const fromDesc = extractFromHtml(item.description || item.contentSnippet || '');
  if (fromDesc) return fromDesc;

  return null;
}