export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { economyParser, ARAB_ECONOMY_FEEDS, isArabicText, isEconomyItem } from '@/lib/economy-feeds';

export async function GET() {
  const results = await Promise.all(
    ARAB_ECONOMY_FEEDS.map(async (feed) => {
      const report: any = {
        provider: feed.provider,
        source: feed.source,
        url: feed.url,
        httpStatus: null,
        error: null,
        totalItems: 0,
        passedArabic: 0,
        passedEconomy: 0,
        passedBoth: 0,
        sampleTitles: [] as string[],
      };

      try {
        // Étape 1 : test HTTP direct
        try {
          const httpRes = await fetch(feed.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
            },
          });
          report.httpStatus = httpRes.status;
        } catch (e: any) {
          report.error = `Fetch failed: ${e.message}`;
          return report;
        }

        // Étape 2 : parsing RSS
        const parsed = await economyParser.parseURL(feed.url);
        report.totalItems = parsed.items?.length || 0;

        // Étape 3 : filtrer comme dans fetchFeed
        for (const item of parsed.items || []) {
          const title = item.title || '';
          const desc = item.contentSnippet || item.content || '';

          const isArabic = isArabicText(title);
          const isEconomy = isEconomyItem(title, desc);

          if (isArabic) report.passedArabic++;
          if (isEconomy) report.passedEconomy++;
          if (isArabic && isEconomy) {
            report.passedBoth++;
            if (report.sampleTitles.length < 3) {
              report.sampleTitles.push(title);
            }
          }
        }
      } catch (e: any) {
        report.error = `Parse failed: ${e.message}`;
      }

      return report;
    })
  );

  return NextResponse.json(results, { status: 200 });
}