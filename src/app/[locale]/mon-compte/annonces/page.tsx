'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { fr: string; ar: string; color: string }> = {
  PENDING: { fr: 'En attente', ar: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' },
  ACTIVE: { fr: 'Active', ar: 'نشط', color: 'bg-green-100 text-green-700' },
  SOLD: { fr: 'Vendue', ar: 'مباع', color: 'bg-blue-100 text-blue-700' },
  EXPIRED: { fr: 'Expirée', ar: 'منتهي', color: 'bg-neutral-100 text-neutral-500' },
  REJECTED: { fr: 'Refusée', ar: 'مرفوض', color: 'bg-red-100 text-red-700' },
};

export default function MesAnnoncesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const isRTL = locale === 'ar';
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.push(`/${locale}/connexion`); return; }
      return r.json();
    }).then(user => {
      if (!user) return;
      // Récupérer les annonces de l'utilisateur
      fetch('/api/listings?myListings=1').then(r => r.json()).then(data => {
        // Filtrer côté client par auteur
        setListings(data.listings || []);
        setLoading(false);
      });
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'حذف هذا الإعلان؟' : 'Supprimer cette annonce ?')) return;
    await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    setListings(l => l.filter(x => x.id !== id));
  };

  const handleMarkSold = async (id: string) => {
    await fetch(`/api/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SOLD' }),
    });
    setListings(l => l.map(x => x.id === id ? { ...x, status: 'SOLD' } : x));
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/${locale}/mon-compte`} className="text-sm text-neutral-500 hover:text-primary-600 mb-1 block">
              ← {isRTL ? 'حسابي' : 'Mon compte'}
            </Link>
            <h1 className="text-2xl font-bold">{isRTL ? 'إعلاناتي' : 'Mes annonces'}</h1>
          </div>
          <Link href={`/${locale}/annonces/nouvelle`} className="btn-primary">
            + {isRTL ? 'إعلان جديد' : 'Nouvelle annonce'}
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-neutral-500 mb-6">
              {isRTL ? 'ليس لديك إعلانات بعد' : "Vous n'avez pas encore d'annonces"}
            </p>
            <Link href={`/${locale}/annonces/nouvelle`} className="btn-primary">
              + {isRTL ? 'نشر أول إعلان' : 'Déposer ma première annonce'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => {
              const status = STATUS_LABELS[listing.status];
              return (
                <div key={listing.id} className="card flex items-center gap-4">
                  {listing.imageUrl1 && (
                    <img src={listing.imageUrl1} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status?.color}`}>
                        {isRTL ? status?.ar : status?.fr}
                      </span>
                    </div>
                    <h3 className="font-semibold truncate">{listing.title}</h3>
                    <p className="text-sm text-neutral-500">
                      {listing.isFree ? (isRTL ? 'مجاني' : 'Gratuit') : listing.price ? `${listing.price} €` : ''}
                      {listing.city && ` • ${listing.city}`}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      👁 {listing.views} • {new Date(listing.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'fr-FR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/${locale}/annonces/${listing.slug}`} className="px-3 py-1.5 border rounded-lg text-xs hover:border-primary-600 text-center">
                      {isRTL ? 'عرض' : 'Voir'}
                    </Link>
                    {listing.status === 'ACTIVE' && (
                      <button onClick={() => handleMarkSold(listing.id)} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs">
                        {isRTL ? 'تم البيع' : 'Vendue'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(listing.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs">
                      {isRTL ? 'حذف' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
