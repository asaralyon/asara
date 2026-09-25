export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

interface Tile {
  label: string;
  value: number;
  unit: string;
}

// ── 1. Devises via open.er-api.com (1 requête = toutes les devises) ──
async function fetchCurrencies(): Promise<Tile[]> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 900 },
    });
    const data = await res.json();
    if (!data?.rates) return [];

    const rates = data.rates as Record<string, number>;
    const tiles: Tile[] = [];

    if (rates.EUR) tiles.push({ label: 'EUR / USD', value: 1 / rates.EUR, unit: '$' });
    if (rates.TRY) tiles.push({ label: 'USD / TRY', value: rates.TRY, unit: '₺' });
    if (rates.GBP) tiles.push({ label: 'GBP / USD', value: 1 / rates.GBP, unit: '$' });
    if (rates.SAR) tiles.push({ label: 'USD / SAR', value: rates.SAR, unit: '﷼' });
    if (rates.AED) tiles.push({ label: 'USD / AED', value: rates.AED, unit: 'د.إ' });

    return tiles;
  } catch {
    return [];
  }
}

// ── 2. Pétrole + Or + Argent via OilPriceAPI demo ──
async function fetchCommodities(): Promise<Tile[]> {
  try {
    const res = await fetch('https://api.oilpriceapi.com/v1/demo/prices', {
      next: { revalidate: 900 },
    });
    const data = await res.json();
    if (!data?.data?.prices) return [];

    const tiles: Tile[] = [];
    const wanted: Record<string, { label: string; unit: string }> = {
      BRENT_CRUDE_USD: { label: 'Brent', unit: '$' },
      WTI_USD:         { label: 'WTI', unit: '$' },
      GOLD_USD:        { label: 'Or (oz)', unit: '$' },
      SILVER_USD:      { label: 'Argent (oz)', unit: '$' },
      NATURAL_GAS_USD: { label: 'Gaz nat.', unit: '$' },
    };

    for (const p of data.data.prices) {
      const meta = wanted[p.code];
      if (meta) {
        tiles.push({ label: meta.label, value: p.price, unit: meta.unit });
      }
    }
    return tiles;
  } catch {
    return [];
  }
}

async function buildTiles(): Promise<Tile[]> {
  const [currencies, commodities] = await Promise.all([
    fetchCurrencies(),
    fetchCommodities(),
  ]);
  return [...currencies, ...commodities];
}

export async function GET() {
  try {
    const tiles = await getCached('markets:live', buildTiles, 900);
    return NextResponse.json(tiles);
  } catch (error) {
    console.error('Markets live error:', error);
    return NextResponse.json([]);
  }
}