export const dynamic = "force-dynamic";
import Link from 'next/link';
import { notFound } from 'next/navigation';

const CATEGORIES: Record<string, { fr: string; ar: string; icon: string }> = {
  EMPLOI: { fr: 'Emploi', ar: 'عمل', icon: '💼' },
  IMMOBILIER: { fr: 'Immobilier', ar: 'عقارات', icon: '🏠' },
  SERVICES: { fr: 'Services', ar: 'خدمات', icon: '🔧' },
  VENTE: { fr: 'Vente', ar: 'بيع', icon: '🛍️' },
  DONS: { fr: 'Dons', ar: 'تبرعات', icon: '🎁' },
  EVENEMENTS: { fr: 'Événements', ar: 'فعاليات', icon: '🎉' },
  COURS: { fr: 'Cours & Formation', ar: 'دروس', icon: '📚' },
  AUTRES: { fr: 'Autres', ar: 'أخرى', icon: '📌' },
};

type Props = { params: { locale: string; slug: string } };

async function getListing(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr'}/api/listings/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ListingPage({ params }: Props) {
  const { locale, slug } = params;
  const isRTL = locale === 'ar';
  const listing = await getListing(slug);
  if (!listing) notFound();

  const cat = CATEGORIES[listing.category];
  const date = new Date(listing.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href={`/${locale}/annonces`} className="hover:text-primary-600">
            {isRTL ? 'الإعلانات' : 'Annonces'}
          </Link>
          <span>›</span>
          <span className="text-neutral-700 truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {listing.imageUrl1 && (
              <div className="grid grid-cols-1 gap-3">
                <img src={listing.imageUrl1} alt={listing.title} className="w-full h-72 object-cover rounded-2xl" />
                {(listing.imageUrl2 || listing.imageUrl3) && (
                  <div className="grid grid-cols-2 gap-3">
                    {listing.imageUrl2 && <img src={listing.imageUrl2} alt="" className="w-full h-40 object-cover rounded-xl" />}
                    {listing.imageUrl3 && <img src={listing.imageUrl3} alt="" className="w-full h-40 object-cover rounded-xl" />}
                  </div>
                )}
              </div>
            )}

            {/* Info principale */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                  {cat?.icon} {isRTL ? cat?.ar : cat?.fr}
                </span>
                {listing.isFree && (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    {isRTL ? 'مجاني' : 'Gratuit'}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">{listing.title}</h1>
              {!listing.isFree && listing.price !== null && (
                <p className="text-3xl font-bold text-primary-600 mb-4">{listing.price} €</p>
              )}
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
                {listing.city && <span>📍 {listing.city}</span>}
                <span>👁 {listing.views} {isRTL ? 'مشاهدة' : 'vues'}</span>
                <span>📅 {date}</span>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">{isRTL ? 'الوصف' : 'Description'}</h3>
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vendeur */}
            <div className="card">
              <h3 className="font-semibold mb-4">{isRTL ? 'المعلن' : 'Annonceur'}</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  {listing.author?.firstName?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{listing.author?.firstName} {listing.author?.lastName}</p>
                  <p className="text-sm text-neutral-500">
                    {isRTL ? 'عضو منذ' : 'Membre depuis'} {new Date(listing.author?.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/annonces/${slug}/contact`}
                className="btn-primary w-full text-center block"
              >
                ✉️ {isRTL ? 'تواصل مع المعلن' : 'Contacter l\'annonceur'}
              </Link>
            </div>

            {/* Retour */}
            <Link href={`/${locale}/annonces`} className="block text-center text-neutral-500 hover:text-primary-600 text-sm">
              ← {isRTL ? 'العودة إلى الإعلانات' : 'Retour aux annonces'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
