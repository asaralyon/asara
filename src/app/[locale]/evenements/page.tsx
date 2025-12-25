export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'events' });
  return {
    title: t('title'),
  };
}

async function getEvents() {
  try {
    const events = await (prisma as any).event.findMany({
      where: { isPublished: true },
      orderBy: { eventDate: 'desc' },
    });
    return events;
  } catch {
    return [];
  }
}

export default async function EventsPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('events');
  const isRTL = locale === 'ar';
  const events = await getEvents();

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="section bg-neutral-50 min-h-screen">
        <div className="container-app">
          <Link
            href={`/${locale}`}
            className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('backToHome')}
          </Link>

          <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

          {events.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">{t('noEvents')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((event: any) => (
                <div key={event.id} className="card">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold mb-2">{event.title}</h2>
                    <div className={`flex flex-wrap gap-4 text-sm text-neutral-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {event.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString(
                            isRTL ? 'ar-SY' : 'fr-FR',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {event.type === 'DOCUMENT' && event.documentUrl ? (
                    event.documentUrl.endsWith('.pdf') ? (
                      <a
                        href={event.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-96 bg-primary-100 rounded-xl flex items-center justify-center hover:bg-primary-200 transition-colors"
                      >
                        <div className="text-center">
                          <span className="text-6xl">📄</span>
                          <p className="text-primary-600 font-medium mt-4">{t('document')}</p>
                        </div>
                      </a>
                    ) : (
                      <img
                        src={event.documentUrl}
                        alt={event.title}
                        className="w-full rounded-xl"
                      />
                    )
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.imageUrl1 && (
                        <img
                          src={event.imageUrl1}
                          alt={event.title}
                          className="w-full rounded-xl"
                        />
                      )}
                      {event.imageUrl2 && (
                        <img
                          src={event.imageUrl2}
                          alt={event.title}
                          className="w-full rounded-xl"
                        />
                      )}
                      {event.imageUrl3 && (
                        <img
                          src={event.imageUrl3}
                          alt={event.title}
                          className="w-full rounded-xl"
                        />
                      )}
                    </div>
                  )}

                  {event.description && (
                    <p className="text-neutral-600 mt-4 whitespace-pre-line">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
