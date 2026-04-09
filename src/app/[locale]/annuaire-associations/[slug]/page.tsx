import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe,
  Facebook, Instagram, Hash, Activity,
} from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

type Props = {
  params: { locale: string; slug: string };
};

async function getAssociation(slug: string) {
  return prisma.associationProfile.findUnique({
    where: { slug, isPublished: true },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const assoc = await getAssociation(params.slug);
  if (!assoc) return { title: 'Not Found' };
  return {
    title: `${assoc.associationName} | ASARA Lyon`,
    description: assoc.description || assoc.activities || assoc.associationName,
  };
}

export default async function AssociationProfilePage({ params }: Props) {
  const { locale, slug } = params;
  const isRTL = locale === 'ar';
  const assoc = await getAssociation(slug);
  if (!assoc) notFound();

  const texts = {
    back: isRTL ? 'رجوع إلى الدليل' : "Retour à l'annuaire",
    about: isRTL ? 'عن الجمعية' : 'À propos',
    activities: isRTL ? 'الأنشطة' : 'Activités',
    contact: isRTL ? 'معلومات الاتصال' : 'Contact',
    registration: isRTL ? 'رقم التسجيل' : "N° d'enregistrement",
    socialMedia: isRTL ? 'وسائل التواصل الاجتماعي' : 'Réseaux sociaux',
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="section bg-neutral-50 min-h-screen">
        <div className="container-app">
          <Link
            href={`/${locale}/annuaire-associations`}
            className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {texts.back}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">

              {/* En-tête */}
              <div className="card">
                <div className={`flex items-start gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {assoc.logoUrl ? (
                    <img
                      src={assoc.logoUrl}
                      alt={assoc.associationName}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-contain bg-neutral-50 border border-neutral-100 p-2 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-5xl font-bold text-primary-500">
                        {assoc.associationName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                      {assoc.associationName}
                    </h1>
                    {assoc.registrationNumber && (
                      <div className={`flex items-center gap-2 text-neutral-500 text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Hash className="w-4 h-4" />
                        <span className="font-mono">
                          {texts.registration} : {assoc.registrationNumber}
                        </span>
                      </div>
                    )}
                    {assoc.city && (
                      <div className={`flex items-center gap-2 text-neutral-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <MapPin className="w-4 h-4 text-primary-400" />
                        <span>{assoc.postalCode ? `${assoc.postalCode} ` : ''}{assoc.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {assoc.description && (
                <div className="card">
                  <h2 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="w-1 h-6 bg-primary-500 rounded-full inline-block" />
                    {texts.about}
                  </h2>
                  <p className={`text-neutral-600 whitespace-pre-line leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                    {assoc.description}
                  </p>
                </div>
              )}

              {/* Activités */}
              {assoc.activities && (
                <div className="card">
                  <h2 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Activity className="w-5 h-5 text-primary-500" />
                    {texts.activities}
                  </h2>
                  <p className={`text-neutral-600 whitespace-pre-line leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                    {assoc.activities}
                  </p>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Coordonnées */}
              <div className="card">
                <h2 className={`font-bold text-lg mb-5 ${isRTL ? 'text-right' : ''}`}>
                  {texts.contact}
                </h2>
                <div className="space-y-4">
                  {(assoc.address || assoc.city) && (
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-neutral-700">
                        {assoc.address && <p>{assoc.address}</p>}
                        {assoc.city && (
                          <p>{assoc.postalCode ? `${assoc.postalCode} ` : ''}{assoc.city}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {assoc.phone && (
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                      <a
                        href={`tel:${assoc.phone}`}
                        className="text-sm text-neutral-700 hover:text-primary-500"
                        dir="ltr"
                      >
                        {assoc.phone}
                      </a>
                    </div>
                  )}
                  {assoc.email && (
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                      <a
                        href={`mailto:${assoc.email}`}
                        className="text-sm text-neutral-700 hover:text-primary-500 break-all"
                        dir="ltr"
                      >
                        {assoc.email}
                      </a>
                    </div>
                  )}
                  {assoc.website && (
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Globe className="w-5 h-5 text-primary-400 flex-shrink-0" />
                      <a
                        href={assoc.website.startsWith('http') ? assoc.website : `https://${assoc.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-500 hover:text-primary-600 break-all font-medium"
                        dir="ltr"
                      >
                        {assoc.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Réseaux sociaux */}
              {(assoc.facebookUrl || assoc.instagramUrl || assoc.tiktokUrl) && (
                <div className="card">
                  <h2 className={`font-bold text-lg mb-5 ${isRTL ? 'text-right' : ''}`}>
                    {texts.socialMedia}
                  </h2>
                  <div className="space-y-3">
                    {assoc.facebookUrl && (
                      <a
                        href={assoc.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <Facebook className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate" dir="ltr">
                          {assoc.facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                        </span>
                      </a>
                    )}
                    {assoc.instagramUrl && (
                      <a
                        href={assoc.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate" dir="ltr">
                          {assoc.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '')}
                        </span>
                      </a>
                    )}
                    {assoc.tiktokUrl && (
                      <a
                        href={assoc.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 bg-neutral-50 text-neutral-800 rounded-xl hover:bg-neutral-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <TikTokIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate" dir="ltr">
                          {assoc.tiktokUrl.replace(/^https?:\/\/(www\.)?tiktok\.com\//, '')}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}