export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Calendar, MapPin, ArrowRight, Users, Building2, Heart } from 'lucide-react';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'home' });
  
  return {
    title: locale === 'ar' 
      ? 'جمعية السوريين في أوفيرن رون ألب | ASARA Lyon'
      : 'Association des Syriens d\'Auvergne Rhône-Alpes | ASARA Lyon',
    description: locale === 'ar'
      ? 'انضم إلى مجتمع ASARA - جمعية السوريين في أوفيرن رون ألب. اكتشف المحترفين السوريين وابق على اطلاع بأحداث المجتمع.'
      : 'Rejoignez la communauté ASARA - Association des Syriens d\'Auvergne Rhône-Alpes. Découvrez les professionnels syriens et restez informé des événements.',
    alternates: {
      canonical: 'https://asara-lyon.fr/' + locale,
    },
  };
}

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { eventDate: 'desc' },
      take: 3,
    });
    return events;
  } catch {
    return [];
  }
}

async function getStats() {
  try {
    const [professionals, members] = await Promise.all([
      prisma.user.count({ where: { role: 'PROFESSIONAL' } }),
      prisma.user.count({ where: { role: 'MEMBER' } }),
    ]);
    return { professionals, members };
  } catch {
    return { professionals: 0, members: 0 };
  }
}

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('home');
  const [events, stats] = await Promise.all([getEvents(), getStats()]);
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* JSON-LD pour SEO */}
      <OrganizationJsonLd locale={locale} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="container-app text-center">
          <Image
            src="/images/logo.png"
            alt="ASARA - Association des Syriens d'Auvergne Rhône-Alpes"
            width={150}
            height={150}
            className="mx-auto mb-6"
            priority
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            {t('subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={'/' + locale + '/annuaire'} className="btn-primary">
              {t('cta.directory')}
            </Link>
            <Link href={'/' + locale + '/adhesion'} className="btn-secondary">
              {t('cta.join')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container-app">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">{stats.professionals}</p>
              <p className="text-sm text-neutral-600">{isRTL ? 'محترفين' : 'Professionnels'}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-secondary-600" />
              </div>
              <p className="text-3xl font-bold text-secondary-600">{stats.members}</p>
              <p className="text-sm text-neutral-600">{isRTL ? 'أعضاء' : 'Membres'}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-accent-600" />
              </div>
              <p className="text-3xl font-bold text-accent-600">100%</p>
              <p className="text-sm text-neutral-600">{isRTL ? 'مجتمع' : 'Communauté'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-neutral-50">
        <div className="container-app">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            {isRTL ? 'خدماتنا' : 'Nos services'}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link href={'/' + locale + '/annuaire'} className="card hover:shadow-strong transition-shadow text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{isRTL ? 'الدليل المهني' : 'Annuaire professionnel'}</h3>
              <p className="text-neutral-600">{isRTL ? 'اكتشف المحترفين السوريين في منطقتك' : 'Découvrez les professionnels syriens de votre région'}</p>
            </Link>
            <Link href={'/' + locale + '/evenements'} className="card hover:shadow-strong transition-shadow text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{isRTL ? 'الفعاليات' : 'Événements'}</h3>
              <p className="text-neutral-600">{isRTL ? 'شارك في فعاليات المجتمع' : 'Participez aux événements de la communauté'}</p>
            </Link>
            <Link href={'/' + locale + '/adhesion'} className="card hover:shadow-strong transition-shadow text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{isRTL ? 'العضوية' : 'Adhésion'}</h3>
              <p className="text-neutral-600">{isRTL ? 'انضم إلى جمعيتنا' : 'Rejoignez notre association'}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Événements */}
      {events.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-app">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold">
                {isRTL ? 'آخر الفعاليات' : 'Derniers événements'}
              </h2>
              <Link href={'/' + locale + '/evenements'} className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                {isRTL ? 'عرض الكل' : 'Voir tout'}
                <ArrowRight className={'w-4 h-4 ' + (isRTL ? 'rotate-180' : '')} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <article key={event.id} className="card">
                  {event.imageUrl1 && (
                    <Image
                      src={event.imageUrl1}
                      alt={event.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  {event.eventDate && (
                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR')}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="container-app text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {isRTL ? 'انضم إلى مجتمعنا اليوم' : 'Rejoignez notre communauté aujourd\'hui'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            {isRTL 
              ? 'كن جزءًا من شبكة نشطة من السوريين في منطقة أوفيرن رون ألب'
              : 'Faites partie d\'un réseau actif de Syriens dans la région Auvergne-Rhône-Alpes'}
          </p>
          <Link href={'/' + locale + '/adhesion'} className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
            {isRTL ? 'سجل الآن' : 'S\'inscrire maintenant'}
            <ArrowRight className={'w-5 h-5 ' + (isRTL ? 'rotate-180' : '')} />
          </Link>
        </div>
      </section>
    </main>
  );
}
