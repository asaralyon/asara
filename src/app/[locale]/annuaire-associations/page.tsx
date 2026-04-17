export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Search, MapPin, Phone, Mail, Globe, ExternalLink, Facebook, Instagram } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

type Props = {
  params: { locale: string };
  searchParams: { city?: string; search?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isRTL = params.locale === 'ar';
  return {
    title: isRTL
      ? 'دليل الجمعيات السورية في فرنسا | ASARA'
      : 'Annuaire des associations syriennes en France | ASARA',
    description: isRTL
      ? 'اكتشف الجمعيات السورية الموجودة في فرنسا'
      : 'Découvrez les associations syriennes présentes en France',
  };
}

async function getAssociations(searchParams: Props['searchParams']) {
  const { city, search } = searchParams;
  const where: any = { isPublished: true };

  if (city) {
    where.city = { contains: city.trim(), mode: 'insensitive' };
  }
  if (search) {
    where.OR = [
      { associationName: { contains: search, mode: 'insensitive' } },
      { activities: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.associationProfile.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { associationName: 'asc' },
  });
}

async function getCitiesFromDB() {
  const associations = await prisma.associationProfile.findMany({
    where: { isPublished: true },
    select: { city: true },
    distinct: ['city'],
  });
  return associations
    .map((a) => a.city?.trim())
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, 'fr')) as string[];
}

export default async function AssociationsDirectoryPage({ params, searchParams }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';

  const [associations, cities] = await Promise.all([
    getAssociations(searchParams),
    getCitiesFromDB(),
  ]);

  const texts = {
    title: isRTL ? 'دليل الجمعيات السورية' : 'Annuaire des Associations Syriennes',
    subtitle: isRTL
      ? 'اكتشف الجمعيات السورية العاملة في فرنسا'
      : 'Découvrez les associations syriennes actives en France',
    search: isRTL ? 'البحث عن جمعية...' : 'Rechercher une association...',
    allCities: isRTL ? 'جميع المدن' : 'Toutes les villes',
    searchBtn: isRTL ? 'بحث' : 'Rechercher',
    count: isRTL ? 'جمعية' : 'association(s)',
    noResults: isRTL ? 'لم يتم العثور على جمعيات' : 'Aucune association trouvée',
    viewProfile: isRTL ? 'عرض الملف' : 'Voir le profil',
    registerCTA: isRTL ? 'تسجيل جمعيتك' : 'Référencer votre association',
    registerDesc: isRTL
      ? 'هل لديك جمعية سورية في فرنسا؟ انضم إلى الدليل.'
      : "Vous gérez une association syrienne en France ? Rejoignez l'annuaire.",
    register: isRTL ? 'التسجيل مجاناً' : "S'inscrire gratuitement",
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container-app text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4 text-sm font-medium">
            🤝 {isRTL ? 'الجمعيات السورية في فرنسا' : 'Associations Syriennes en France'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-4">
            {texts.title}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {texts.subtitle}
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-6 bg-white border-b border-neutral-100 sticky top-16 z-10">
        <div className="container-app">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 ${isRTL ? 'right-4' : 'left-4'}`}
              />
              <input
                type="text"
                name="search"
                placeholder={texts.search}
                defaultValue={searchParams.search || ''}
                className={`input ${isRTL ? 'pr-12' : 'pl-12'}`}
              />
            </div>
            <select
              name="city"
              defaultValue={searchParams.city || ''}
              className="input sm:w-48"
            >
              <option value="">{texts.allCities}</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary whitespace-nowrap">
              {texts.searchBtn}
            </button>
          </form>
        </div>
      </section>

      {/* Liste */}
      <section className="section bg-neutral-50">
        <div className="container-app">
          <p className="text-neutral-600 mb-6 font-medium">
            {associations.length} {texts.count}
          </p>

          {associations.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-neutral-500 text-lg">{texts.noResults}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {associations.map((assoc) => (
                <div
                  key={assoc.id}
                  className="card hover:shadow-strong transition-all duration-300 flex flex-col"
                >
                  {/* Header carte */}
                  <Link href={`/${locale}/annuaire-associations/${assoc.slug}`}>
                    <div className={`flex items-start gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {assoc.logoUrl ? (
                        <img
                          src={assoc.logoUrl}
                          alt={assoc.associationName}
                          className="w-16 h-16 rounded-xl object-contain bg-neutral-50 border border-neutral-100 p-1 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-primary-500">
                            {assoc.associationName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary-600 transition-colors">
                          {assoc.associationName}
                        </h3>
                        {assoc.registrationNumber && (
                          <p className="text-xs text-neutral-400 mt-1 font-mono">
                            N° {assoc.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Activités */}
                  {assoc.activities && (
                    <p className={`text-sm text-neutral-600 line-clamp-2 mb-4 flex-1 ${isRTL ? 'text-right' : ''}`}>
                      {assoc.activities}
                    </p>
                  )}

                  {/* Contact */}
                  <div className={`space-y-2 text-sm text-neutral-600 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    {assoc.city && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span>{assoc.postalCode ? `${assoc.postalCode} ` : ''}{assoc.city}</span>
                      </div>
                    )}
                    {assoc.phone && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <a href={`tel:${assoc.phone}`} className="hover:text-primary-500" dir="ltr">
                          {assoc.phone}
                        </a>
                      </div>
                    )}
                    {assoc.email && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <a href={`mailto:${assoc.email}`} className="truncate hover:text-primary-500" dir="ltr">
                          {assoc.email}
                        </a>
                      </div>
                    )}
                    {assoc.website && (
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <a
                          href={assoc.website.startsWith('http') ? assoc.website : `https://${assoc.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-primary-500"
                          dir="ltr"
                        >
                          {assoc.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Réseaux sociaux */}
                  {(assoc.facebookUrl || assoc.instagramUrl || assoc.tiktokUrl) && (
                    <div className={`flex gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {assoc.facebookUrl && (
                        <a
                          href={assoc.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                          title="Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}
                      {assoc.instagramUrl && (
                        <a
                          href={assoc.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-200 transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {assoc.tiktokUrl && (
                        <a
                          href={assoc.tiktokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors"
                          title="TikTok"
                        >
                          <TikTokIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/${locale}/annuaire-associations/${assoc.slug}`}
                    className={`mt-auto pt-4 border-t border-neutral-100 flex items-center gap-1 text-primary-500 font-medium text-sm hover:text-primary-600 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {texts.viewProfile}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* CTA inscription */}
          <div className="mt-16 card bg-gradient-to-br from-primary-50 to-green-50 border-2 border-primary-200 text-center py-10">
            <div className="text-4xl mb-4">🏛️</div>
            <h2 className="text-xl font-bold text-primary-700 mb-2">{texts.registerCTA}</h2>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">{texts.registerDesc}</p>
            <Link href={`/${locale}/adhesion/association`} className="btn-primary inline-flex">
              {texts.register}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}