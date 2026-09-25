'use client';

import { useState, useEffect } from 'react';

interface Tile { label: string; value: number; unit: string }

export function GlobalMarketsBanner({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    fetch('/api/markets/live')
      .then((r) => r.json())
      .then((d) => setTiles(Array.isArray(d) ? d : []))
      .catch(() => setTiles([]));
  }, []);

  if (tiles.length === 0) return null;

  return (
    <div className="bg-neutral-900 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app py-2.5 flex items-center gap-6 overflow-x-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 whitespace-nowrap">
          {isRTL ? 'الأسواق العالمية' : 'Marchés mondiaux'}
        </span>
        {tiles.map((tile, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs text-neutral-400">{tile.label}</span>
            <span className="text-sm font-mono font-semibold">
              {tile.value.toLocaleString(isRTL ? 'ar-SA' : 'fr-FR', { maximumFractionDigits: 4 })} {tile.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}