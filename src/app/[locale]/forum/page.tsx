'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  _count: { threads: number };
}

interface Thread {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: string;
  createdAt: string;
  author: { id: string; name: string };
  category: { id: string; name: string; color: string; slug: string };
}

function AdBanner({ position }: { position: 'top' | 'sidebar' | 'between' }) {
  const sizes = { top: 'h-24 w-full', sidebar: 'h-64 w-full', between: 'h-20 w-full my-4' };
  return (
    <div className={`${sizes[position]} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
      <div className="text-center text-gray-400">
        <p className="text-xs font-medium uppercase tracking-widest">Espace publicitaire</p>
        <p className="text-xs mt-1">Google AdSense</p>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return locale === 'ar' ? 'الآن' : "à l'instant";
  if (diff < 3600) return locale === 'ar' ? `منذ ${Math.floor(diff / 60)} د` : `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return locale === 'ar' ? `منذ ${Math.floor(diff / 3600)} س` : `il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return locale === 'ar' ? `منذ ${Math.floor(diff / 86400)} ي` : `il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR');
}

export default function ForumPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations('forum');

  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/forum/categories?locale=${locale}`).then((r) => r.json()).then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: '20' });
    if (selectedCategory) p.set('categoryId', selectedCategory);
    fetch(`/api/forum/threads?${p}`)
      .then((r) => r.json())
      .then((data) => { setThreads(data.threads || []); setTotalPages(data.pagination?.pages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCategory, page]);

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <AdBanner position="top" />
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
              </div>
              <Link href={`/${locale}/forum/nouveau`} className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('newThread')}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => { setSelectedCategory(null); setPage(1); }} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-green-700 text-white' : 'bg-white text-gray-600 border hover:border-green-700 hover:text-green-700'}`}>
                {t('allCategories')}
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedCategory === cat.id ? 'text-white' : 'bg-white text-gray-600'}`}
                  style={selectedCategory === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : { borderColor: '#e5e7eb' }}>
                  {cat.name} <span className="opacity-70">({cat._count.threads})</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="bg-white rounded-lg p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>)}</div>
            ) : threads.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noThreads')}</h3>
                <p className="text-gray-500 mb-6">{t('noThreadsSubtitle')}</p>
                <Link href={`/${locale}/forum/nouveau`} className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-800">{t('createThread')}</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((thread, index) => (
                  <div key={thread.id}>
                    {index > 0 && index % 10 === 0 && <AdBanner position="between" />}
                    <Link href={`/${locale}/forum/discussion/${thread.slug}`} className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-transparent hover:border-green-100">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-800 font-bold text-sm">
                          {thread.author?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {thread.isPinned && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">📌 {t('pinnedTag')}</span>}
                            {thread.isLocked && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">🔒 {t('lockedTag')}</span>}
                            <span className="text-xs px-2 py-0.5 rounded font-medium text-white" style={{ backgroundColor: thread.category?.color || '#16a34a' }}>{thread.category?.name}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 leading-snug truncate">{thread.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{thread.content.slice(0, 120)}{thread.content.length > 120 ? '...' : ''}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>{thread.author?.name}</span>
                            <span>•</span>
                            <span>{timeAgo(thread.createdAt, locale)}</span>
                            <span className="ml-auto flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                {thread.replyCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {thread.viewCount}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-green-700 hover:text-green-700">
                  {isRTL ? 'التالي →' : '← Précédent'}
                </button>
                <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-green-700 hover:text-green-700">
                  {isRTL ? '→ السابق' : 'Suivant →'}
                </button>
              </div>
            )}
          </div>

          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <AdBanner position="sidebar" />
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-900 mb-3">📋 {t('rules')}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span>{t('rule1')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span>{t('rule2')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span>{t('rule3')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span>{t('rule4')}</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span>{t('rule5')}</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-900 mb-3">{t('categories')}</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.id === selectedCategory ? null : cat.id); setPage(1); }} className="w-full flex items-center justify-between text-sm py-1 hover:text-green-700 transition-colors text-left">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-gray-400 text-xs">{cat._count.threads}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
