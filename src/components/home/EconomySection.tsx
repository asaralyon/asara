'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';

interface EconomyItem { title: string; link: string; pubDate?: string; source: string; image?: string | null }

export function EconomySection({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const [items, setItems] = useState<EconomyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news/economy')
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-12 bg-neutral-50 border-t border-neutral-200">
      <div className="container-app">
        <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide rounded">
            {isRTL ? 'اقتصاد' : 'Économie'}
          </span>
          <h2 className="text-xl font-bold">
            {isRTL ? 'اقتصاد سوريا' : "L'économie syrienne"}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {items.map((item, i) => (
              
                <a
                href={item.link}
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
                  <p className="font-medium text-neutral-800 leading-snug line-clamp-3 flex-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                    <span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR') : ''}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
