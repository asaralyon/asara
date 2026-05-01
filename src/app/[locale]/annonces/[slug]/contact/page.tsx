'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContactAnnonceurPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const slug = params?.slug as string;
  const isRTL = locale === 'ar';

  const [listing, setListing] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifier auth
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => {
        if (!r.ok) {
          router.push(`/${locale}/connexion?redirect=/${locale}/annonces/${slug}/contact`);
          return null;
        }
        setIsLoggedIn(true);
        return r.json();
      })
      .catch(() => router.push(`/${locale}/connexion`));

    // Charger l'annonce
    fetch(`/api/listings/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setListing(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, locale, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch(`/api/listings/${listing.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: message }),
      });

      if (res.status === 401) {
        router.push(`/${locale}/connexion`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'envoi');
        return;
      }

      setSent(true);
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">
          {isRTL ? 'جارٍ التحميل...' : 'Chargement...'}
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">
            {isRTL ? 'الإعلان غير موجود' : 'Annonce introuvable'}
          </p>
          <Link href={`/${locale}/annonces`} className="btn-primary">
            {isRTL ? 'العودة إلى الإعلانات' : 'Retour aux annonces'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app max-w-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href={`/${locale}/annonces`} className="hover:text-primary-600">
            {isRTL ? 'الإعلانات' : 'Annonces'}
          </Link>
          <span>›</span>
          <Link href={`/${locale}/annonces/${slug}`} className="hover:text-primary-600 truncate max-w-xs">
            {listing.title}
          </Link>
          <span>›</span>
          <span>{isRTL ? 'تواصل' : 'Contact'}</span>
        </nav>

        <div className="card">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
              {listing.author?.firstName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-neutral-500">
                {isRTL ? 'التواصل مع' : 'Contacter'}
              </p>
              <p className="font-semibold">{listing.author?.firstName} {listing.author?.lastName}</p>
              <p className="text-sm text-neutral-500 truncate max-w-xs">
                {isRTL ? 'بخصوص' : 'À propos de'} : {listing.title}
              </p>
            </div>
          </div>

          {sent ? (
            /* Message envoyé */
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                {isRTL ? 'تم إرسال رسالتك!' : 'Message envoyé !'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {isRTL
                  ? 'سيتواصل معك المعلن في أقرب وقت ممكن'
                  : "L'annonceur vous répondra dans les plus brefs délais"}
              </p>
              <Link href={`/${locale}/annonces/${slug}`} className="btn-primary">
                {isRTL ? 'العودة إلى الإعلان' : "Retour à l'annonce"}
              </Link>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isRTL ? 'رسالتك' : 'Votre message'} *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  required
                  placeholder={isRTL
                    ? 'اكتب رسالتك هنا... (لا صور ولا روابط خارجية)'
                    : 'Écrivez votre message ici... (pas de photos ni de liens externes)'}
                  className="input w-full resize-y"
                />
                <p className={`text-xs mt-1 ${message.length > 900 ? 'text-orange-500' : 'text-neutral-400'}`}>
                  {message.length}/1000
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                🔒 {isRTL
                  ? 'رسالتك محمية وخاصة. لا تشارك معلومات شخصية حساسة.'
                  : 'Votre message est privé et protégé. Ne partagez pas d\'informations personnelles sensibles.'}
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/${locale}/annonces/${slug}`}
                  className="flex-1 text-center py-3 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 font-medium"
                >
                  {isRTL ? 'إلغاء' : 'Annuler'}
                </Link>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      {isRTL ? 'جارٍ الإرسال...' : 'Envoi...'}
                    </>
                  ) : (
                    <>✉️ {isRTL ? 'إرسال الرسالة' : 'Envoyer le message'}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
