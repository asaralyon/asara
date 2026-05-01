'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, Package } from 'lucide-react';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const listingId = params?.listingId as string;
  const isRTL = locale === 'ar';
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [listing, setListing] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    const res = await fetch(`/api/listings/${listingId}/messages`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push(`/${locale}/connexion`); return; }
      const me = await meRes.json();
      setUserId(me.id);

      const listingRes = await fetch(`/api/listings/${listingId}`, { credentials: 'include' });
      if (listingRes.ok) setListing(await listingRes.json());

      await fetchMessages();
      setLoading(false);
    };
    init();

    // Polling toutes les 10 secondes pour nouveaux messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [listingId, locale, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || newMessage.length < 2) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/listings/${listingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.status === 403) {
        setError(isRTL ? 'لا يمكنك التواصل مع نفسك' : 'Vous ne pouvez pas vous contacter vous-même');
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erreur');
        return;
      }
      setNewMessage('');
      await fetchMessages();
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header fixe */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-10">
        <div className="container-app max-w-3xl py-4">
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Link
              href={`/${locale}/mon-compte/messages`}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
              {listing?.imageUrl1 ? (
                <img src={listing.imageUrl1} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-neutral-400" />
                </div>
              )}
            </div>
            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
              <p className="font-semibold text-neutral-800 truncate">
                {listing?.title || (isRTL ? 'المحادثة' : 'Conversation')}
              </p>
              <Link
                href={`/${locale}/annonces/${listing?.slug}`}
                className="text-xs text-primary-600 hover:underline"
              >
                {isRTL ? 'عرض الإعلان' : "Voir l'annonce"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 container-app max-w-3xl py-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            {isRTL ? 'لا توجد رسائل بعد' : 'Aucun message pour le moment'}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isMe ? '' : ''}`}>
                    {/* Nom expéditeur */}
                    <p className={`text-xs text-neutral-400 mb-1 ${isMe ? (isRTL ? 'text-left' : 'text-right') : (isRTL ? 'text-right' : 'text-left')}`}>
                      {isMe
                        ? (isRTL ? 'أنت' : 'Vous')
                        : `${msg.sender?.firstName} ${msg.sender?.lastName}`}
                    </p>
                    {/* Bulle */}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isMe
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {/* Heure */}
                    <p className={`text-xs text-neutral-400 mt-1 ${isMe ? (isRTL ? 'text-left' : 'text-right') : (isRTL ? 'text-right' : 'text-left')}`}>
                      {new Date(msg.createdAt).toLocaleTimeString(
                        isRTL ? 'ar-SA' : 'fr-FR',
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                      {isMe && (
                        <span className="ml-1">
                          {msg.isRead ? ' ✓✓' : ' ✓'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie fixe en bas */}
      <div className="bg-white border-t border-neutral-200 sticky bottom-0">
        <div className="container-app max-w-3xl py-4">
          {error && (
            <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
          )}
          <form onSubmit={handleSend} className={`flex items-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
              placeholder={isRTL ? 'اكتب رسالتك...' : 'Écrivez votre message...'}
              rows={2}
              className="input flex-1 resize-none"
              maxLength={1000}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              type="submit"
              disabled={sending || newMessage.trim().length < 2}
              className="btn-primary flex-shrink-0 flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              )}
            </button>
          </form>
          <p className="text-xs text-neutral-400 mt-1 text-center">
            {isRTL ? 'Enter للإرسال • Shift+Enter لسطر جديد' : 'Enter pour envoyer • Shift+Enter pour nouvelle ligne'}
          </p>
        </div>
      </div>
    </main>
  );
}
