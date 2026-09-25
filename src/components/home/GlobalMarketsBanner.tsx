'use client';

import { useState, useEffect } from 'react';

interface Tile {
  label: string;
  value: number;
  unit: string;
  change?: number;
  icon?: string;
}

function formatValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
  if (value >= 100) {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 4 });
}

function TickerItem({ tile, isRTL }: { tile: Tile; isRTL: boolean }) {
  const change = typeof tile.change === 'number' ? tile.change : null;
  const positive = change !== null && change >= 0;

  return (
    <div className="flex items-center gap-2 whitespace-nowrap px-6">
      {tile.icon && <span className="text-base">{tile.icon}</span>}
      <span className="text-xs text-neutral-400 uppercase tracking-wider">{tile.label}</span>
      <span className="text-sm font-mono font-semibold text-white">
        {formatValue(tile.value)}
        <span className="text-neutral-500 ml-1 text-xs">{tile.unit}</span>
      </span>
      {change !== null && (
        <span
          className={`text-xs font-mono font-medium ${
            positive ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {positive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      )}
      <span className="text-neutral-700">|</span>
    </div>
  );
}

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

  // On duplique la liste pour créer une boucle infinie fluide
  const doubled = [...tiles, ...tiles];

  return (
    <div
      className="bg-neutral-900 text-white overflow-hidden border-b border-neutral-800"
      dir="ltr"
    >
      <div className="flex items-center">
        {/* Label fixe à gauche */}
        <div className="bg-amber-500 text-neutral-900 px-4 py-2.5 flex items-center gap-2 shrink-0 z-10">
          <span className="text-base">📊</span>
          <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            {isRTL ? 'الأسواق' : 'Marchés'}
          </span>
        </div>

        {/* Zone défilante */}
        <div className="relative flex-1 overflow-hidden group">
          <div
            className="flex animate-ticker group-hover:[animation-play-state:paused]"
            style={{ animationDirection: isRTL ? 'reverse' : 'normal' }}
          >
            {doubled.map((tile, i) => (
              <TickerItem key={i} tile={tile} isRTL={isRTL} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}