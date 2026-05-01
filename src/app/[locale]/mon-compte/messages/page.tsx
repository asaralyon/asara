'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Loader2, ArrowLeft, Package } from 'lucide-react';

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const isRTL = locale === 'ar';

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) { router.push(`/${locale}/connexion`); return; }
      const me = await meRes.json();
      setUserId(me.id);

      const res = await fetch('/api/user/messages', { credentials: 'include' });
      if (res.ok) setConversations(await res.json());
      setLoading(false);
    };
    init();
  }, [locale, router]);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <section className="section">
        <div className="container-app max-w-3xl">
          <Link
            href={`/${locale}/mon-compte`}
            className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'حسابي' : 'Mon compte'}
          </Link>

          <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className="w-7 h-7 text-primary-500" />
            <h1 className="text-2xl font-bold">
              {isRTL ? 'رسائلي' : 'Mes messages'}
            </h1>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {totalUnread}
              </span>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="card text-center py-16">
              <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 text-lg">
                {isRTL ? 'لا توجد رسائل بعد' : 'Aucun message pour le moment'}
              </p>
              <Link href={`/${locale}/annonces`} className="btn-primary inline-flex mt-4">
                {isRTL ? 'تصفح الإعلانات' : 'Parcourir les annonces'}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link
                  key={conv.listingId}
                  href={`/${locale}/mon-compte/messages/${conv.listingId}`}
                  className={`card flex items-start gap-4 hover:shadow-md transition-all border-2 ${conv.unreadCount > 0 ? 'border-primary-300 bg-primary-50' : 'border-transparent'} ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {/* Image annonce */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                    {conv.listing?.imageUrl1 ? (
                      <img src={conv.listing.imageUrl1} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <p className="font-semibold text-neutral-800 truncate">
                        {conv.listing?.title}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 mb-1">
                      {isRTL ? 'مع' : 'Avec'}{' '}
                      <span className="font-medium">
                        {conv.otherPerson?.firstName} {conv.otherPerson?.lastName}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {conv.lastMessage?.senderId === userId
                        ? (isRTL ? 'أنت: ' : 'Vous: ')
                        : ''}
                      {conv.lastMessage?.content}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(conv.lastMessage?.createdAt).toLocaleDateString(
                        isRTL ? 'ar-SA' : 'fr-FR',
                        { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
