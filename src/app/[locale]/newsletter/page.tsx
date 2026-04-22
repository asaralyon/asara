export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Calendar, Mail, ArrowLeft, ExternalLink, Newspaper } from 'lucide-react';
import NewsletterSubscribeButton from '@/components/NewsletterSubscribeButton';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isRTL = params.locale === 'ar';
  return {
    title: isRTL ? 'النشرة الأسبوعية - ASARA' : 'Newsletter - ASARA',
    description: isRTL 
      ? 'اشترك في نشرتنا الأسبوعية للحصول على آخر الأخبار والفعاليات'
      : 'Inscrivez-vous à notre newsletter pour recevoir les dernières actualités',
  };
}

function toHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
}

function toGregorianArabic(date: Date): string {
  return new Intl.DateTimeFormat('ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function toGregorianFrench(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

async function getUpcomingEvents() {
  const today = new Date();
  return (prisma as any).event.findMany({
    where: {
      isPublished: true,
      eventDate: { gte: today }
    },
    orderBy: { eventDate: 'asc' },
    take: 5
  });
}

async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
}

async function getNewsletterLinks() {
  try {
    return await (prisma as any).newsletterLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  } catch {
    return [];
  }
}

export default async function NewsletterPage({ params }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asara-france.fr';
  
  const [events, articles, newsLinks] = await Promise.all([
    getUpcomingEvents(),
    getPublishedArticles(),
    getNewsletterLinks()
  ]);

  const today = new Date();
  const hijriDate = toHijriDate(today);
  const gregorianDate = isRTL ? toGregorianArabic(today) : toGregorianFrench(today);
  const shareUrl = baseUrl + '/' + locale + '/newsletter';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-12">
        <div className="container-app">
          <Link
            href={'/' + locale}
            className={'inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 ' + (isRTL ? 'flex-row-reverse' : '')}
          >
            <ArrowLeft className={'w-4 h-4 ' + (isRTL ? 'rotate-180' : '')} />
            {isRTL ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil'}
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Mail className="w-5 h-5" />
              <span className="font-medium">{isRTL ? 'النشرة الأسبوعية' : 'Newsletter'}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? 'النشرة الأسبوعية' : 'Newsletter Hebdomadaire'}
            </h1>
            
            <div className="flex flex-col items-center gap-1 text-white/90">
              {isRTL && <p className="text-lg">{hijriDate}</p>}
              <p className="text-lg">{gregorianDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Articles de presse */}
          {newsLinks.length > 0 && (
            <section className="card">
              <h2 className={'text-xl font-bold mb-6 flex items-center gap-3 ' + (isRTL ? 'flex-row-reverse' : '')}>
                <Newspaper className="w-6 h-6 text-primary-600" />
                {isRTL ? 'مقالات صحفية' : 'Articles de presse'}
              </h2>
              
              <div className="space-y-3">
                {newsLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-neutral-50 rounded-xl hover:bg-primary-50 transition-colors border border-transparent hover:border-primary-200"
                  >
                    <div className={'flex items-start gap-3 ' + (isRTL ? 'flex-row-reverse' : '')}>
                      <span className="text-xl">🔗</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary-700 hover:text-primary-800">
                          {link.title}
                        </h3>
                        {link.source && (
                          <p className="text-sm text-neutral-500 mt-1">
                            {isRTL ? 'المصدر: ' : 'Source: '}{link.source}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-neutral-400" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Événements */}
          <section className="card">
            <h2 className={'text-xl font-bold mb-6 flex items-center gap-3 ' + (isRTL ? 'flex-row-reverse' : '')}>
              <Calendar className="w-6 h-6 text-primary-600" />
              {isRTL ? 'الفعاليات القادمة' : 'Événements à venir'}
            </h2>
            
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event: any) => (
                  <div key={event.id} className="p-4 bg-neutral-50 rounded-xl">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-neutral-600 text-sm mb-3">
                      {new Date(event.eventDate).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      {event.location && ' • ' + event.location}
                    </p>
                    <Link
                      href={'/' + locale + '/evenements'}
                      className={'inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm ' + (isRTL ? 'flex-row-reverse' : '')}
                    >
                      {isRTL ? 'عرض التفاصيل' : 'Voir les détails'}
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">
                {isRTL ? 'لا توجد فعاليات قادمة حالياً' : 'Aucun événement à venir pour le moment'}
              </p>
            )}
            
            <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
              <Link
                href={'/' + locale + '/evenements'}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isRTL ? 'عرض جميع الفعاليات ←' : 'Voir tous les événements →'}
              </Link>
            </div>
          </section>

          {/* Articles de la communauté */}
          {articles.length > 0 && (
            <section className="card">
              <h2 className={'text-xl font-bold mb-6 flex items-center gap-3 ' + (isRTL ? 'flex-row-reverse' : '')}>
                <span className="text-2xl">✍️</span>
                {isRTL ? 'مقالات من المجتمع' : 'Articles de la communauté'}
              </h2>
              
              <div className="space-y-6">
                {articles.map((article: any) => (
                  <div key={article.id} className="p-5 bg-green-50 rounded-xl border-2 border-green-200">
                    <h3 className="font-bold text-lg text-primary-700 mb-3 pb-3 border-b border-green-200">
                      {article.title}
                    </h3>
                    <p className="text-neutral-700 whitespace-pre-line leading-relaxed">
                      {article.content}
                    </p>
                    <p className="mt-4 pt-3 border-t border-green-200 text-primary-600 font-medium text-sm">
                      ✍️ {article.authorName}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inscription */}
          <section className="card bg-gradient-to-br from-primary-50 to-green-50 border-2 border-primary-200">
            <div className="text-center py-4">
              <h2 className="text-xl font-bold text-primary-700 mb-3">
                {isRTL ? 'اشترك في نشرتنا الأسبوعية' : 'Inscrivez-vous à notre newsletter'}
              </h2>
              <p className="text-neutral-600 mb-6">
                {isRTL 
                  ? 'احصل على آخر الأخبار والفعاليات مباشرة في بريدك الإلكتروني'
                  : 'Recevez les dernières actualités et événements directement dans votre boîte mail'}
              </p>
              <NewsletterSubscribeButton locale={locale} />
            </div>
          </section>

          {/* Partager */}
          <section className="card text-center">
            <h2 className="font-semibold mb-4">
              {isRTL ? 'شارك هذه النشرة' : 'Partager cette newsletter'}
            </h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href={'https://wa.me/?text=' + encodeURIComponent((isRTL ? 'النشرة الأسبوعية - ASARA: ' : 'Newsletter ASARA: ') + shareUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Facebook
              </a>
            </div>
            <p className="mt-4 text-sm text-neutral-500">
              {shareUrl}
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
