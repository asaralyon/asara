'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Author {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Reply {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  author: Author;
  category: { id: string; name: string; color: string; slug: string };
  replies: Reply[];
}

interface CurrentUser {
  id: string;
  name: string;
  role: string;
}

function renderContentWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-green-700 underline hover:text-green-900 break-all">{part}</a>
    ) : <span key={i}>{part}</span>
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
  return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function AdBanner() {
  return (
    <div className="h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center my-6">
      <div className="text-center text-gray-400">
        <p className="text-xs font-medium uppercase tracking-widest">Espace publicitaire</p>
        <p className="text-xs mt-0.5">Google AdSense</p>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const slug = params?.slug as string;
  const t = useTranslations('forum');
  const isRTL = locale === 'ar';

  const [thread, setThread] = useState<Thread | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adminAction, setAdminAction] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ userId: string; userName: string } | null>(null);
  const [banForm, setBanForm] = useState({ reason: '', isPermanent: false, durationDays: 7 });

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/threads/${slug}`);
      if (!res.ok) { setLoading(false); return; }
      setThread(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchThread();
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then(setCurrentUser).catch(() => {});
  }, [fetchThread]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { router.push(`/${locale}/connexion`); return; }
    if (replyContent.length < 5) { setReplyError(isRTL ? 'الرد قصير جداً (5 أحرف على الأقل)' : 'Réponse trop courte (minimum 5 caractères)'); return; }
    setSubmitting(true); setReplyError('');
    try {
      const res = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, threadId: thread!.id }),
      });
      if (res.status === 401) { router.push(`/${locale}/connexion`); return; }
      if (res.status === 403) { const data = await res.json(); setReplyError(data.error); return; }
      if (!res.ok) { setReplyError(isRTL ? 'حدث خطأ، حاول مجدداً' : 'Une erreur est survenue'); return; }
      setReplyContent('');
      fetchThread();
    } catch {
      setReplyError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAction = async (action: string, threadId: string) => {
    setAdminAction(action);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) { if (action === 'delete') router.push(`/${locale}/forum`); else fetchThread(); }
    } finally { setAdminAction(null); }
  };

  const handleDeleteReply = async (replyId: string) => {
    await fetch(`/api/forum/replies/${replyId}`, { method: 'DELETE' });
    fetchThread();
  };

  const handleBan = async () => {
    if (!banModal) return;
    await fetch('/api/forum/bans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: banModal.userId, ...banForm }),
    });
    setBanModal(null);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-400">{isRTL ? 'جارٍ التحميل...' : 'Chargement...'}</div>
    </div>
  );

  if (!thread) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('threadNotFound')}</h2>
        <Link href={`/${locale}/forum`} className="text-green-700 hover:underline">{t('backToForum')}</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}/forum`} className="hover:text-green-700">{isRTL ? 'المنتدى' : 'Forum'}</Link>
          <span>›</span>
          <span className="text-gray-700 truncate max-w-xs">{thread.title}</span>
        </nav>

        <div className="bg-white rounded-xl border overflow-hidden mb-4">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {thread.isPinned && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">📌 {t('pinnedTag')}</span>}
              {thread.isLocked && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">🔒 {t('lockedTag')}</span>}
              <span className="text-xs px-2 py-0.5 rounded font-medium text-white" style={{ backgroundColor: thread.category.color }}>{thread.category.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
                {thread.author?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{thread.author?.name}</p>
                <p className="text-xs text-gray-400">{timeAgo(thread.createdAt, locale)}</p>
              </div>
              {isAdmin && (
                <button onClick={() => setBanModal({ userId: thread.author.id, userName: thread.author.name })} className="ml-auto text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                  {t('ban')}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{renderContentWithLinks(thread.content)}</div>
            <div className="flex items-center gap-6 mt-6 pt-4 border-t text-xs text-gray-400">
              <span>👁 {thread.viewCount} {t('views')}</span>
              <span>💬 {thread.replies.length} {thread.replies.length > 1 ? t('replies') : t('reply')}</span>
              {isAdmin && (
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => handleAdminAction('pin', thread.id)} disabled={adminAction === 'pin'} className="text-amber-600 border border-amber-200 px-2 py-1 rounded hover:bg-amber-50">
                    {thread.isPinned ? t('unpin') : t('pin')}
                  </button>
                  <button onClick={() => handleAdminAction('lock', thread.id)} disabled={adminAction === 'lock'} className="text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50">
                    {thread.isLocked ? t('unlock') : t('lock')}
                  </button>
                  <button onClick={() => { if (confirm(isRTL ? 'حذف هذا الموضوع؟' : 'Supprimer cette discussion ?')) handleAdminAction('delete', thread.id); }} disabled={adminAction === 'delete'} className="text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                    🗑 {t('delete')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <AdBanner />

        {thread.replies.length > 0 && (
          <div className="space-y-3 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
              {thread.replies.length} {thread.replies.length > 1 ? t('replies') : t('reply')}
            </h2>
            {thread.replies.map((reply, index) => (
              <div key={reply.id}>
                {index > 0 && index % 8 === 0 && <AdBanner />}
                <div className="bg-white rounded-xl border p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm flex-shrink-0">
                      {reply.author?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{reply.author?.name}</p>
                      <p className="text-xs text-gray-400">{timeAgo(reply.createdAt, locale)}</p>
                    </div>
                    {(isAdmin || currentUser?.id === reply.author?.id) && (
                      <button onClick={() => { if (confirm(isRTL ? 'حذف هذا الرد؟' : 'Supprimer cette réponse ?')) handleDeleteReply(reply.id); }} className="text-xs text-red-400 hover:text-red-600">
                        {t('delete')}
                      </button>
                    )}
                    {isAdmin && currentUser?.id !== reply.author?.id && (
                      <button onClick={() => setBanModal({ userId: reply.author.id, userName: reply.author.name })} className="text-xs text-red-400 border border-red-200 px-2 py-0.5 rounded hover:bg-red-50">
                        {t('ban')}
                      </button>
                    )}
                  </div>
                  <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap pl-11">{renderContentWithLinks(reply.content)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!thread.isLocked ? (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t('yourReply')}</h3>
            {!currentUser ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">{t('loginToReply')}</p>
                <Link href={`/${locale}/connexion`} className="bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 inline-block">{t('login')}</Link>
              </div>
            ) : (
              <form onSubmit={handleReply}>
                <textarea value={replyContent}
                  onChange={(e) => { setReplyContent(e.target.value); if (replyError) setReplyError(''); }}
                  placeholder={t('replyPlaceholder')} rows={5}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-sm ${replyError ? 'border-red-300' : 'border-gray-300'}`}
                  maxLength={3000} />
                <div className="flex items-center justify-between mt-2">
                  <div>{replyError && <p className="text-red-500 text-xs">{replyError}</p>}</div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs ${replyContent.length > 2700 ? 'text-orange-500' : 'text-gray-400'}`}>{replyContent.length}/3000</span>
                    <button type="submit" disabled={submitting} className="px-5 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 flex items-center gap-2">
                      {submitting ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('publishing')}</>) : t('publishReply')}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-xl p-6 text-center text-gray-500">
            🔒 {t('lockedThread')}
          </div>
        )}
      </div>

      {banModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="font-bold text-gray-900 mb-1">{t('banUser')}</h3>
            <p className="text-sm text-gray-500 mb-4"><strong>{banModal.userName}</strong></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('banReason')}</label>
                <textarea value={banForm.reason} onChange={(e) => setBanForm((f) => ({ ...f, reason: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="permanent" checked={banForm.isPermanent} onChange={(e) => setBanForm((f) => ({ ...f, isPermanent: e.target.checked }))} className="rounded" />
                <label htmlFor="permanent" className="text-sm text-gray-700">{t('banPermanent')}</label>
              </div>
              {!banForm.isPermanent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('banDuration')}</label>
                  <input type="number" min={1} max={365} value={banForm.durationDays} onChange={(e) => setBanForm((f) => ({ ...f, durationDays: parseInt(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBanModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleBan} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{t('banConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
