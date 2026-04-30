'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';

export default function ContactAnnonceurPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const slug = params?.slug as string;
  const isRTL = locale === 'ar';

  const [listing, setListing] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (!meRes.ok) {
        router.push(`/${locale}/connexion?returnTo=/${locale}/annonces/${slug}/contact`);
        return;
      }
      setUser(await meRes.json());

      const listingRes = await fetch(`/api/listings/${slug}`, { credentials: 'include' });
      if (!listingRes.ok) {
        router.push(`/${locale}/annonces`);
        return;
      }
      setListing(await listingRes.json());
      setLoading(false);
    };
    init();
  }, [slug, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length < 10) {
      setError(isRTL ? 'الرسالة قصيرة جداً (10 أحرف على الأقل)' : 'Message trop court (10 caractères minimum)');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/listings/${listing.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: message }),
      });
      if (res.status === 401) { router.push(`/${locale}/connexion`); return; }
      if (res.status === 403) {
        setError(isRTL ? 'لا يمكنك التواصل مع نفسك' : 'Vous ne pouvez pas vous contacter vous-même');
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Erreur');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setMessage('');
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <section className="section">
        <div className="container-app max-w-2xl">

          <Link
            href={`/${locale}/annonces/${slug}`}
            className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'العودة إلى الإعلان' : "Retour à l'annonce"}
          </Link>

          {listing && (
            <div className="card mb-6 bg-primary-50 border border-primary-200">
              <p className="text-sm text-primary-600 font-medium mb-1">
                {isRTL ? 'الإعلان' : 'Annonce'}
              </p>
              <p className="font-bold text-neutral-800">{listing.title}</p>
              {listing.author && (
                <p className="text-sm text-neutral-500 mt-1">
                  {isRTL ? 'المعلن:' : 'Annonceur:'} {listing.author.firstName} {listing.author.lastName}
                </p>
              )}
            </div>
          )}

          <div className="card">
            <h1 className={`text-xl font-bold mb-6 ${isRTL ? 'text-right' : ''}`}>
              ✉️ {isRTL ? 'تواصل مع المعلن' : "Contacter l'annonceur"}
            </h1>

            <div className={`flex items-start gap-3 p-4 bg-blue-50 text-blue-700 rounded-xl mb-6 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                {isRTL
                  ? 'رسالتك ستصل مباشرة للمعلن. معلوماتك الشخصية محمية.'
                  : "Votre message sera transmis directement à l'annonceur. Vos coordonnées restent confidentielles."}
              </p>
            </div>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-700 mb-2">
                  {isRTL ? 'تم إرسال رسالتك!' : 'Message envoyé !'}
                </h2>
                <p className="text-neutral-600 mb-6">
                  {isRTL ? 'سيتواصل معك المعلن قريباً.' : "L'annonceur vous répondra prochainement."}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href={`/${locale}/annonces`} className="btn-primary">
                    {isRTL ? 'العودة إلى الإعلانات' : 'Retour aux annonces'}
                  </Link>
                  <button onClick={() => setSuccess(false)} className="btn-secondary">
                    {isRTL ? 'إرسال رسالة أخرى' : 'Envoyer un autre message'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className={`flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="label">
                    {isRTL ? 'رسالتك' : 'Votre message'} *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setError(''); }}
                    placeholder={isRTL
                      ? 'اكتب رسالتك هنا...'
                      : 'Écrivez votre message ici...'}
                    className="input resize-none"
                    maxLength={1000}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-neutral-400">{message.length}/1000</span>
                    {message.length < 10 && message.length > 0 && (
                      <span className="text-xs text-red-400">
                        {isRTL
                          ? `${10 - message.length} أحرف أخرى`
                          : `encore ${10 - message.length} caractères`}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || message.length < 10}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />{isRTL ? 'إرسال...' : 'Envoi...'}</>
                  ) : (
                    <><Send className="w-5 h-5" />{isRTL ? 'إرسال الرسالة' : 'Envoyer le message'}</>
                  )}
                </button>
              </form>
            )}
          </div>

          {user && (
            <p className={`text-center text-sm text-neutral-500 mt-4 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'أنت تتواصل بوصفك' : 'Vous contactez en tant que'}{' '}
              <span className="font-medium text-neutral-700">
                {user.firstName} {user.lastName}
              </span>
            </p>
          )}

        </div>
      </section>
    </main>
  );
}
