'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

export default function NouvellAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const isRTL = locale === 'ar';

  const [form, setForm] = useState({
    title: '', description: '', category: 'AUTRES',
    price: '', isFree: false, city: '', postalCode: '',
    imageUrl1: '', imageUrl2: '', imageUrl3: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');
  try {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // ← MANQUAIT
      body: JSON.stringify({
        ...form,
        price: form.isFree ? null : (parseFloat(form.price) || null),
        // Nettoyer les chaînes vides
        imageUrl1: form.imageUrl1 || undefined,
        imageUrl2: form.imageUrl2 || undefined,
        imageUrl3: form.imageUrl3 || undefined,
        city: form.city || undefined,
        postalCode: form.postalCode || undefined,
      }),
    });
    if (res.status === 401) { router.push(`/${locale}/connexion`); return; }
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); return; }
    router.push(`/${locale}/mon-compte/annonces`);
  } catch { 
    setError('Erreur de connexion'); 
  } finally { 
    setSubmitting(false); 
  }
};

  return (
    <div className="min-h-screen bg-neutral-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app max-w-2xl">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href={`/${locale}/annonces`} className="hover:text-primary-600">
            {isRTL ? 'الإعلانات' : 'Annonces'}
          </Link>
          <span>›</span>
          <span>{isRTL ? 'إعلان جديد' : 'Nouvelle annonce'}</span>
        </nav>

        <div className="card">
          <h1 className="text-xl font-bold mb-6">{isRTL ? 'نشر إعلان جديد' : 'Déposer une annonce'}</h1>

          {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-6">{error}</div>}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
            ℹ️ {isRTL ? 'ستخضع إعلاناتك للمراجعة قبل النشر' : 'Votre annonce sera vérifiée avant publication'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isRTL ? 'الفئة' : 'Catégorie'} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`p-3 rounded-xl text-sm font-medium text-left border-2 transition-all ${form.category === cat.value ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 hover:border-primary-200'}`}
                  >
                    {cat.icon} {isRTL ? cat.labelAr : cat.labelFr}
                  </button>
                ))}
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">{isRTL ? 'العنوان' : 'Titre'} *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input w-full" maxLength={100} required
                placeholder={isRTL ? 'عنوان واضح ومختصر' : 'Titre clair et concis'} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">{isRTL ? 'الوصف' : 'Description'} *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input w-full resize-y" rows={6} maxLength={3000} required
                placeholder={isRTL ? 'وصف تفصيلي لإعلانك' : 'Description détaillée de votre annonce'} />
              <p className="text-xs text-neutral-400 mt-1">{form.description.length}/3000</p>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">{isRTL ? 'السعر' : 'Prix'}</label>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFree} onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))} className="rounded" />
                  <span className="text-sm">{isRTL ? 'مجاني' : 'Gratuit'}</span>
                </label>
              </div>
              {!form.isFree && (
                <div className="flex items-center gap-2">
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="input flex-1" min="0" step="0.01"
                    placeholder={isRTL ? 'السعر بالأورو' : 'Prix en euros'} />
                  <span className="text-neutral-500 font-medium">€</span>
                </div>
              )}
            </div>

            {/* Localisation */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{isRTL ? 'المدينة' : 'Ville'}</label>
                <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{isRTL ? 'الرمز البريدي' : 'Code postal'}</label>
                <input type="text" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className="input w-full" />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {isRTL ? 'روابط الصور (اختياري)' : 'URLs des photos (optionnel)'}
              </label>
              {[1,2,3].map(n => (
                <input key={n} type="url" value={form[`imageUrl${n}` as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [`imageUrl${n}`]: e.target.value }))}
                  className="input w-full mb-2" placeholder={`https://... (${isRTL ? 'صورة' : 'photo'} ${n})`} />
              ))}
            </div>

            <div className="flex gap-4 pt-2">
              <Link href={`/${locale}/annonces`} className="flex-1 text-center py-3 border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50">
                {isRTL ? 'إلغاء' : 'Annuler'}
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? '...' : (isRTL ? 'نشر الإعلان' : 'Publier l\'annonce')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
