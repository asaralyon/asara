'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

interface EconomyItem { title: string; link: string; pubDate?: string; source: string; image?: string | null }

function isValidLink(link: string): boolean {
  try { new URL(link); return true; } catch { return false; }
}

function ItemGrid({ items, isRTL }: { items: EconomyItem[]; isRTL: boolean }) {
  const valid = items.filter((it) => isValidLink(it.link));
  if (valid.length === 0) {
    return <p className="text-sm text-neutral-400 py-6">{isRTL ? 'لا توجد أخبار حالياً' : 'Aucune actualité pour le moment'}</p>;
  }
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {valid.map((item, i) => (
        <a href={item.link}
          key={i}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-neutral-200 hover:border-amber-400 hover:shadow-md transition-all overflow-hidden flex flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-40 bg-amber-50 flex items-center justify-center">
              <span className="text-3xl">📈</span>
            </div>
          )}
          <div className="p-4 flex-1 flex flex-col">
            <p className="text-xs text-amber-600 font-medium mb-2">{item.source}</p>
            <p className="font-medium text-neutral-800 leading-snug line-clamp-3 flex-1 break-words">{item.title}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
              <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR') : ''}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export function EconomySection({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const [tab, setTab] = useState<'syria' | 'arab'>('syria');
  const [syriaItems, setSyriaItems] = useState<EconomyItem[]>([]);
  const [arabItems, setArabItems] = useState<EconomyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/news/economy').then((r) => r.json()).catch(() => []),
      fetch('/api/news/economy-arab').then((r) => r.json()).catch(() => []),
    ]).then(([syria, arab]) => {
      setSyriaItems(Array.isArray(syria) ? syria : []);
      setArabItems(Array.isArray(arab) ? arab : []);
      setLoading(false);
    });
  }, []);

  return (
    <section className="py-12 bg-neutral-50 border-t border-neutral-200">
      <div className="container-app">
        <div className={`flex items-center gap-4 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide rounded">
            {isRTL ? 'اقتصاد' : 'Économie'}
          </span>
          <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={() => setTab('syria')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${tab === 'syria' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
            >
              {isRTL ? 'سوريا' : 'Syrie'}
            </button>
            <button onClick={() => setTab('arab')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${tab === 'arab' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
            >
              {isRTL ? 'العالم العربي' : 'Monde arabe'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <ItemGrid items={tab === 'syria' ? syriaItems : arabItems} isRTL={isRTL} />
        )}
      </div>
    </section>
  );
}
