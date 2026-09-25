export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

interface Tile {
  label: string;
  value: number;
  unit: string;
  change?: number;      // variation 24h en %
  icon?: string;        // emoji optionnel
}

// ── 1. Devises (open.er-api.com) ──
async function fetchCurrencies(): Promise<Tile[]> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 900 },
    });
    const data = await res.json();
    if (!data?.rates) return [];

    const rates = data.rates as Record<string, number>;
    const tiles: Tile[] = [];

    if (rates.EUR) tiles.push({ label: 'EUR / USD', value: 1 / rates.EUR, unit: '$', icon: '💶' });
    if (rates.TRY) tiles.push({ label: 'USD / TRY', value: rates.TRY, unit: '₺', icon: '🇹🇷' });
    if (rates.GBP) tiles.push({ label: 'GBP / USD', value: 1 / rates.GBP, unit: '$', icon: '💷' });
    if (rates.SAR) tiles.push({ label: 'USD / SAR', value: rates.SAR, unit: '﷼', icon: '🇸🇦' });
    if (rates.AED) tiles.push({ label: 'USD / AED', value: rates.AED, unit: 'د.إ', icon: '🇦🇪' });

    return tiles;
  } catch {
    return [];
  }
}

// ── 2. Pétrole + Or + Argent + Gaz (OilPriceAPI) ──
async function fetchCommodities(): Promise<Tile[]> {
  try {
    const res = await fetch('https://api.oilpriceapi.com/v1/demo/prices', {
      next: { revalidate: 900 },
    });
    const data = await res.json();
    if (!data?.data?.prices) return [];

    const tiles: Tile[] = [];
    const wanted: Record<string, { label: string; unit: string; icon: string }> = {
      GOLD_USD:        { label: 'Or (oz)', unit: '$', icon: '🥇' },
      BRENT_CRUDE_USD: { label: 'Brent', unit: '$', icon: '🛢️' },
      WTI_USD:         { label: 'WTI', unit: '$', icon: '🛢️' },
      SILVER_USD:      { label: 'Argent (oz)', unit: '$', icon: '🥈' },
      NATURAL_GAS_USD: { label: 'Gaz nat.', unit: '$', icon: '🔥' },
    };

    for (const p of data.data.prices) {
      const meta = wanted[p.code];
      if (meta) {
        tiles.push({
          label: meta.label,
          value: p.price,
          unit: meta.unit,
          change: typeof p.change_24h === 'number' ? p.change_24h : undefined,
          icon: meta.icon,
        });
      }
    }
    return tiles;
  } catch {
    return [];
  }
}

// ── 3. Cryptos (CoinGecko, gratuit, sans clé) ──
async function fetchCrypto(): Promise<Tile[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 900 } }
    );
    const data = await res.json();
    if (!data) return [];

    const tiles: Tile[] = [];
    if (data.bitcoin) {
      tiles.push({
        label: 'Bitcoin',
        value: data.bitcoin.usd,
        unit: '$',
        change: data.bitcoin.usd_24h_change,
        icon: '₿',
      });
    }
    if (data.ethereum) {
      tiles.push({
        label: 'Ethereum',
        value: data.ethereum.usd,
        unit: '$',
        change: data.ethereum.usd_24h_change,
        icon: 'Ξ',
      });
    }
    if (data.solana) {
      tiles.push({
        label: 'Solana',
        value: data.solana.usd,
        unit: '$',
        change: data.solana.usd_24h_change,
        icon: '◎',
      });
    }
    return tiles;
  } catch {
    return [];
  }
}

async function buildTiles(): Promise<Tile[]> {
  const [currencies, commodities, crypto] = await Promise.all([
    fetchCurrencies(),
    fetchCommodities(),
    fetchCrypto(),
  ]);
  // Ordre d'affichage : Or, Pétrole, Cryptos, Devises
  return [...commodities, ...crypto, ...currencies];
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