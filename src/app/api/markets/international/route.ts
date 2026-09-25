export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getCached } from '@/lib/cache';

interface MarketTile { label: string; value: number; unit: string }

async function fetchEurUsd(): Promise<MarketTile | null> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
    const data = await res.json();
    return { label: 'EUR / USD', value: data.rates.USD, unit: '$' };
  } catch {
    return null;
  }
}

async function fetchAlphaVantageRate(fromCurrency: string, label: string, unit: string): Promise<MarketTile | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=USD&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const rate = data['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
    if (!rate) return null;
    return { label, value: parseFloat(rate), unit };
  } catch {
    return null;
  }
}

async function fetchBrent(): Promise<MarketTile | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const latest = data.data?.[0]?.value;
    if (!latest) return null;
    return { label: 'Brent', value: parseFloat(latest), unit: '$/baril' };
  } catch {
    return null;
  }
}

async function fetchAll(): Promise<MarketTile[]> {
  const results = await Promise.all([
    fetchEurUsd(),
    fetchAlphaVantageRate('XAU', 'Or', '$/oz'),
    fetchBrent(),
  ]);
  return results.filter((x): x is MarketTile => x !== null);
}

export async function GET() {
  try {
    const data = await getCached('markets:international', fetchAll, 3600);
    return NextResponse.json(data);
  } catch (error) {
    console.error('International markets error:', error);
    return NextResponse.json([]);
  }
}
