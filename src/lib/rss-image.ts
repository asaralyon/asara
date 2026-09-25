import type { Item as RSSItem } from 'rss-parser';

export function extractImage(item: RSSItem & Record<string, any>): string | null {
  try {
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) return item.enclosure.url;

    if (item['media:content']) {
      const media = item['media:content'];
      const list = Array.isArray(media) ? media : [media];
      for (const m of list) {
        const url = m?.$?.url || m?.url;
        if (typeof url === 'string' && url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return url;
      }
    }

    if (item['media:thumbnail']) {
      const thumb = item['media:thumbnail'];
      const t = Array.isArray(thumb) ? thumb[0] : thumb;
      const url = t?.$?.url || t?.url;
      if (typeof url === 'string') return url;
    }

    const content = item['content:encoded'] || item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      let url = imgMatch[1];
      if (url.startsWith('//')) url = 'https:' + url;
      if (url.startsWith('http')) return url;
    }
  } catch {
    /* silent */
  }
  return null;
}
