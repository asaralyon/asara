export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ARAB_ECONOMY_FEEDS, fetchFeed } from '@/lib/economy-feeds';

export async function GET() {
  const results = await Promise.all(
    ARAB_ECONOMY_FEEDS.map(async (feed) => {
      const report: any = {
        provider: feed.provider,
        url: feed.url,
        fetchFeedResult: 0,
        error: null,
        sampleTitles: [] as string[],
      };

      try {
        const items = await fetchFeed(feed, {
          requireArabic: true,
          requireEconomy: true,
          requireSyria: false,
        });
        report.fetchFeedResult = items.length;
        report.sampleTitles = items.slice(0, 3).map((i) => i.title);
      } catch (e: any) {
        report.error = e.message || String(e);
      }

      return report;
    })
  );

  return NextResponse.json(results, { status: 200 });
}
