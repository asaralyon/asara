export const dynamic = "force-dynamic";
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Calendar, MapPin, ArrowRight, Newspaper } from 'lucide-react';
import { NewsSection } from '@/components/home/NewsSection';

async function getEvents() {
  try {
    const events = await (prisma as any).event.findMany({
      where: { isPublished: true },
      orderBy: { eventDate: 'desc' },
      take: 3,
    });
    return events;
  } catch {
    return [];
  }
}

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('home');
  const events = await getEvents();
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero - Logo et nom */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container-app text-center">
          <Image
            src="/images/logo.png"
            alt="ASARA"
            width={150}
            height={150}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-neutral-600">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Événements - Pleine largeur */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">{t('events.title')}</h2>
            </div>
            <Link
              href={`/${locale}/evenements`}
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              {t('events.viewAll')}
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 bg-neutral-50 rounded-2xl">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">{t('events.noEvents')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/${locale}/evenements`}
                  className="block card overflow-hidden hover:shadow-strong transition-shadow"
                >
                  {/* Photos d'abord */}
                  <div className="mb-4">
                    {event.type === 'DOCUMENT' && event.documentUrl ? (
                      event.documentUrl.endsWith('.pdf') ? (
                        <div className="w-full h-64 bg-primary-100 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-4xl">📄</span>
                            <p className="text-primary-600 font-medium mt-2">Document PDF</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={event.documentUrl}
                          alt={event.title}
                          className="w-full aspect-video object-contain rounded-xl bg-neutral-100"
                        />
                      )
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {event.imageUrl1 && (
                          <img
                            src={event.imageUrl1}
                            alt={event.title}
                            className="w-full aspect-video object-contain rounded-xl bg-neutral-100"
                          />
                        )}
                        {event.imageUrl2 && (
                          <img
                            src={event.imageUrl2}
                            alt={event.title}
                            className="w-full aspect-video object-contain rounded-xl bg-neutral-100"
                          />
                        )}
                        {event.imageUrl3 && (
                          <img
                            src={event.imageUrl3}
                            alt={event.title}
                            className="w-full aspect-video object-contain rounded-xl bg-neutral-100"
                          />
                        )}
                        {!event.imageUrl1 && !event.imageUrl2 && !event.imageUrl3 && (
                          <div className="w-full h-64 bg-primary-100 rounded-xl flex items-center justify-center col-span-full">
                            <Calendar className="w-12 h-12 text-primary-300" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Texte en dessous */}
                  <div>
                    <h3 className="font-bold text-xl mb-3">{event.title}</h3>
                    
                    <div className={`flex flex-wrap gap-4 text-sm text-neutral-500 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {event.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString(isRTL ? 'ar-SY' : 'fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-neutral-600 line-clamp-3">
                        {event.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Actualités RSS */}
      <section className="section bg-neutral-50">
        <div className="container-app">
          <div className="flex items-center gap-3 mb-8">
            <Newspaper className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold">{t('news.title')}</h2>
          </div>
          <NewsSection />
        </div>
      </section>

      {/* CTA Adhésion */}
      <section className="section bg-primary-500">
        <div className="container-app text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/adhesion/professionnel`}
              className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
            >
              {t('cta.professional')}
            </Link>
            <Link
              href={`/${locale}/adhesion/membre`}
              className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors border border-primary-400"
            >
              {t('cta.member')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
