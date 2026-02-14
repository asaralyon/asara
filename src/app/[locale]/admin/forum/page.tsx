'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Ban {
  id: string;
  reason: string;
  isPermanent: boolean;
  expiresAt: string | null;
  bannedAt: string;
  user: { id: string; name: string; email: string };
  bannedBy: { id: string; name: string };
}

interface Thread {
  id: string;
  title: string;
  slug: string;
  isDeleted: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  viewCount: number;
  replyCount: number;
  author: { name: string; email: string };
  category: { name: string; color: string };
}

type Tab = 'threads' | 'bans' | 'categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  _count: { threads: number };
}

function CategoryManager({ locale }: { locale: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#16a34a', order: 0 });

  useEffect(() => {
    fetch('/api/forum/categories').then((r) => r.json()).then(setCategories);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/forum/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
      setForm({ name: '', slug: '', description: '', color: '#16a34a', order: 0 });
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">
          + Nouvelle catégorie
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Créer une catégorie</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <div className="flex gap-2">
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-12 h-9 border rounded cursor-pointer" />
                <input type="text" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Créer</button>
            </div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Discussions</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Couleur</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 text-gray-600">{cat._count.threads}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-gray-400 font-mono">{cat.color}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="py-12 text-center text-gray-400">Aucune catégorie</div>}
      </div>
    </div>
  );
}

export default function AdminForumPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const [activeTab, setActiveTab] = useState<Tab>('threads');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'threads') {
        const res = await fetch('/api/forum/threads?limit=50&page=1');
        const data = await res.json();
        setThreads(data.threads || []);
      } else if (activeTab === 'bans') {
        const res = await fetch('/api/forum/bans');
        const data = await res.json();
        setBans(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleThreadAction = async (action: string, threadId: string) => {
    await fetch(`/api/forum/threads/${threadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchData();
  };

  const handleUnban = async (userId: string) => {
    await fetch(`/api/forum/bans?userId=${userId}`, { method: 'DELETE' });
    fetchData();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'threads', label: 'Discussions', icon: '💬' },
    { key: 'bans', label: 'Utilisateurs bannis', icon: '🚫' },
    { key: 'categories', label: 'Catégories', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modération du Forum</h1>
            <p className="text-gray-500 mt-1">Gérez les discussions, réponses et utilisateurs bannis</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/${locale}/forum`} target="_blank" className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Voir le forum →</Link>
            <Link href={`/${locale}/admin`} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900">← Admin</Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-5">
            <div className="text-3xl font-bold text-gray-900">{threads.filter((t) => !t.isDeleted).length}</div>
            <div className="text-sm text-gray-500 mt-1">Discussions actives</div>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <div className="text-3xl font-bold text-red-600">{threads.filter((t) => t.isDeleted).length}</div>
            <div className="text-sm text-gray-500 mt-1">Discussions supprimées</div>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <div className="text-3xl font-bold text-orange-600">{bans.length}</div>
            <div className="text-sm text-gray-500 mt-1">Utilisateurs bannis</div>
          </div>
        </div>

        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-green-700 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">{[1,2,3].map((i) => <div key={i} className="h-16 bg-white rounded-xl border" />)}</div>
        ) : (
          <>
            {activeTab === 'threads' && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Discussion</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Auteur</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Catégorie</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Stats</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {threads.map((thread) => (
                      <tr key={thread.id} className={`hover:bg-gray-50 ${thread.isDeleted ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <Link href={`/${locale}/forum/discussion/${thread.slug}`} target="_blank" className="font-medium text-gray-900 hover:text-green-700 line-clamp-1 max-w-xs block">{thread.title}</Link>
                          <span className="text-xs text-gray-400">{new Date(thread.createdAt).toLocaleDateString('fr-FR')}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{thread.author?.name}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: thread.category?.color || '#16a34a' }}>{thread.category?.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          <span>👁 {thread.viewCount}</span> <span className="ml-2">💬 {thread.replyCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          {thread.isDeleted ? <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">🗑 Supprimé</span>
                           : thread.isPinned ? <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">📌 Épinglé</span>
                           : thread.isLocked ? <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">🔒 Fermé</span>
                           : <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✓ Actif</span>}
                        </td>
                        <td className="px-4 py-3">
                          {!thread.isDeleted && (
                            <div className="flex items-center gap-1 justify-end">
                              <button onClick={() => handleThreadAction('pin', thread.id)} title={thread.isPinned ? 'Désépingler' : 'Épingler'} className="p-1.5 hover:bg-amber-50 rounded text-amber-600">📌</button>
                              <button onClick={() => handleThreadAction('lock', thread.id)} title={thread.isLocked ? 'Déverrouiller' : 'Verrouiller'} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">{thread.isLocked ? '🔓' : '🔒'}</button>
                              <button onClick={() => { if (confirm('Supprimer ?')) handleThreadAction('delete', thread.id); }} title="Supprimer" className="p-1.5 hover:bg-red-50 rounded text-red-500">🗑</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {threads.length === 0 && <div className="py-12 text-center text-gray-400">Aucune discussion</div>}
              </div>
            )}

            {activeTab === 'bans' && (
              <div className="bg-white rounded-xl border overflow-hidden">
                {bans.length === 0 ? (
                  <div className="py-12 text-center text-gray-400"><p className="text-xl mb-2">✅</p><p>Aucun utilisateur banni</p></div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Utilisateur</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Raison</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Durée</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Banni par</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bans.map((ban) => (
                        <tr key={ban.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><p className="font-medium text-gray-900">{ban.user?.name}</p><p className="text-xs text-gray-400">{ban.user?.email}</p></td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs"><p className="line-clamp-2">{ban.reason}</p></td>
                          <td className="px-4 py-3">
                            {ban.isPermanent
                              ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">🚫 Permanent</span>
                              : ban.expiresAt
                                ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Jusqu&apos;au {new Date(ban.expiresAt).toLocaleDateString('fr-FR')}</span>
                                : <span className="text-xs text-gray-400">Non définie</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{ban.bannedBy?.name}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => { if (confirm('Lever ce bannissement ?')) handleUnban(ban.user?.id); }} className="text-xs text-green-700 border border-green-200 px-3 py-1 rounded hover:bg-green-50 font-medium">
                              Lever le ban
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'categories' && <CategoryManager locale={locale} />}
          </>
        )}
      </div>
    </div>
  );
}
