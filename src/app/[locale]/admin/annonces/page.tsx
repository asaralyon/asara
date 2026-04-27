'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const STATUS_LABELS: Record<string, { fr: string; color: string }> = {
  PENDING: { fr: 'En attente', color: 'bg-amber-100 text-amber-700' },
  ACTIVE: { fr: 'Active', color: 'bg-green-100 text-green-700' },
  SOLD: { fr: 'Vendue', color: 'bg-blue-100 text-blue-700' },
  EXPIRED: { fr: 'Expirée', color: 'bg-neutral-100 text-neutral-500' },
  REJECTED: { fr: 'Refusée', color: 'bg-red-100 text-red-700' },
};

export default function AdminAnnoncesPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchListings = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/listings');
    if (res.ok) setListings(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const handleStatus = async (id: string, status: string) => {
    await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchListings();
  };

  const filtered = listings.filter(l => filter === 'ALL' || l.status === filter);
  const pending = listings.filter(l => l.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
              🏷️ Modération des annonces
              {pending > 0 && <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">{pending}</span>}
            </h1>
          </div>
          <Link href={`/${locale}/admin`} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">← Admin</Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['ALL', 'PENDING', 'ACTIVE', 'REJECTED', 'SOLD', 'EXPIRED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border hover:border-primary-600'}`}>
              {s === 'ALL' ? 'Toutes' : STATUS_LABELS[s]?.fr} ({s === 'ALL' ? listings.length : listings.filter(l => l.status === s).length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl" />)}</div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Annonce</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Auteur</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Catégorie</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Prix</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(listing => (
                  <tr key={listing.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/annonces/${listing.slug}`} target="_blank" className="font-medium hover:text-primary-600 line-clamp-1 max-w-xs block">
                        {listing.title}
                      </Link>
                      <span className="text-xs text-neutral-400">{new Date(listing.createdAt).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {listing.author?.firstName} {listing.author?.lastName}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{listing.category}</td>
                    <td className="px-4 py-3 font-medium">
                      {listing.isFree ? <span className="text-green-600">Gratuit</span> : listing.price ? `${listing.price} €` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_LABELS[listing.status]?.color}`}>
                        {STATUS_LABELS[listing.status]?.fr}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {listing.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleStatus(listing.id, 'ACTIVE')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                              ✓ Approuver
                            </button>
                            <button onClick={() => handleStatus(listing.id, 'REJECTED')}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                              ✗ Refuser
                            </button>
                          </>
                        )}
                        {listing.status === 'ACTIVE' && (
                          <button onClick={() => handleStatus(listing.id, 'REJECTED')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                            Désactiver
                          </button>
                        )}
                        {listing.status === 'REJECTED' && (
                          <button onClick={() => handleStatus(listing.id, 'ACTIVE')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                            Réactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-12 text-center text-neutral-400">Aucune annonce</div>}
          </div>
        )}
      </div>
    </div>
  );
}
