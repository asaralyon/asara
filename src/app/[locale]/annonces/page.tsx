export const dynamic = "force-dynamic";
import Link from 'next/link';
import { notFound } from 'next/navigation';

const CATEGORIES = [
  { value: 'EMPLOI', labelFr: 'Emploi', labelAr: 'عمل', icon: '💼' },
  { value: 'IMMOBILIER', labelFr: 'Immobilier', labelAr: 'عقارات', icon: '🏠' },
  { value: 'SERVICES', labelFr: 'Services', labelAr: 'خدمات', icon: '🔧' },
  { value: 'VENTE', labelFr: 'Vente', labelAr: 'بيع', icon: '🛍️' },
  { value: 'DONS', labelFr: 'Dons', labelAr: 'تبرعات', icon: '🎁' },
  { value: 'EVENEMENTS', labelFr: 'Événements', labelAr: 'فعاليات', icon: '🎉' },
  { value: 'COURS', labelFr: 'Cours & Formation', labelAr: 'دروس', icon: '📚' },
  { value: 'AUTRES', labelFr: 'Autres', labelAr: 'أخرى', icon: '📌' },
];

type Props = {
  params: { locale: string };
  searchParams: { category?: string; city?: string; search?: string; page?: string };
};

async function getListings(searchParams: Props['searchParams']) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.city) params.set('city', searchParams.city);
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.page) params.set('page', searchParams.page);

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr'}/api/listings?${params}`, { cache: 'no-store' });
  if (!res.ok) return { listings: [], total: 0, pages: 1 };
  return res.json();
}

export default async function AnnoncesPage({ params, searchParams }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';
  const { listings, total, pages } = await getListings(searchParams);
  const currentPage = parseInt(searchParams.page || '1');

  const texts = {
    title: isRTL ? 'الإعلانات المبوبة' : 'Petites Annonces',
    subtitle: isRTL ? 'بيع، شراء، خدمات بين أعضاء المجتمع' : 'Entre membres de la communauté syrienne en France',
    newAd: isRTL ? '+ إعلان جديد' : '+ Déposer une annonce',
    all: isRTL ? 'الكل' : 'Toutes',
    free: isRTL ? 'مجاني' : 'Gratuit',
    contact: isRTL ? 'Contacter' : 'Contacter',
    noAds: isRTL ? 'لا توجد إعلانات' : 'Aucune annonce pour le moment',
    results: isRTL ? 'إعلان' : 'annonce(s)',
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-600 mb-2">{texts.title}</h1>
              <p className="text-neutral-600">{texts.subtitle}</p>
            </div>
            <Link href={`/${locale}/annonces/nouvelle`} className="btn-primary whitespace-nowrap">
              {texts.newAd}
            </Link>
          </div>
        </div>
      </section>

      {/* Filtres catégories */}
      <section className="bg-white border-b py-4 sticky top-16 z-10">
        <div className="container-app">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            <Link
              href={`/${locale}/annonces`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!searchParams.category ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50'}`}
            >
              {texts.all}
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/${locale}/annonces?category=${cat.value}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${searchParams.category === cat.value ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50'}`}
              >
                {cat.icon} {isRTL ? cat.labelAr : cat.labelFr}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="section bg-neutral-50">
        <div className="container-app">
          <p className="text-neutral-600 mb-6">{total} {texts.results}</p>

          {listings.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-neutral-500 text-lg mb-6">{texts.noAds}</p>
              <Link href={`/${locale}/annonces/nouvelle`} className="btn-primary">
                {texts.newAd}
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing: any) => {
                const cat = CATEGORIES.find(c => c.value === listing.category);
                return (
                  <Link key={listing.id} href={`/${locale}/annonces/${listing.slug}`} className="card hover:shadow-strong transition-all flex flex-col">
                    {listing.imageUrl1 && (
                      <img src={listing.imageUrl1} alt={listing.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                        {cat?.icon} {isRTL ? cat?.labelAr : cat?.labelFr}
                      </span>
                      {listing.isFree && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {texts.free}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{listing.title}</h3>
                    <p className="text-neutral-600 text-sm line-clamp-2 flex-1">{listing.description}</p>
                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <div>
                        {listing.price !== null && !listing.isFree && (
                          <span className="font-bold text-primary-600 text-lg">{listing.price} €</span>
                        )}
                        {listing.isFree && <span className="font-bold text-green-600">{texts.free}</span>}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {listing.city && `📍 ${listing.city}`}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/${locale}/annonces?page=${p}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${p === currentPage ? 'bg-primary-600 text-white' : 'hover:border-primary-600'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
