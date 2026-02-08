import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const url =
    `https://geo.api.gouv.fr/communes` +
    `?nom=${encodeURIComponent(q)}` +
    `&fields=nom,code,codeDepartement,codesPostaux` +
    `&boost=population&limit=10`;

  const r = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      {
        error: `geo.api.gouv.fr error ${r.status}`,
        details: text.slice(0, 200),
      },
      { status: 502 }
    );
  }

  const data = await r.json();
  return NextResponse.json(data);
}
