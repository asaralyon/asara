'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function NewThreadPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations('forum');
  const isRTL = locale === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: '', content: '', categoryId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/forum/categories').then((r) => r.json()).then(setCategories).catch(console.error);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.categoryId) errs.categoryId = t('categoryRequired');
    if (form.title.length < 5) errs.title = isRTL ? 'العنوان قصير جداً (5 أحرف على الأقل)' : 'Le titre doit faire au moins 5 caractères';
    if (form.title.length > 150) errs.title = isRTL ? 'العنوان طويل جداً' : 'Titre trop long (max 150 caractères)';
    if (form.content.length < 20) errs.content = isRTL ? 'المحتوى قصير جداً (20 حرفاً على الأقل)' : 'Le contenu doit faire au moins 20 caractères';
    if (form.content.length > 5000) errs.content = isRTL ? 'المحتوى طويل جداً' : 'Contenu trop long (max 5000 caractères)';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 401) { router.push(`/${locale}/connexion`); return; }
      if (res.status === 403) { const data = await res.json(); setErrors({ general: data.error }); return; }
      if (!res.ok) { const data = await res.json(); setErrors({ general: data.error }); return; }
      const thread = await res.json();
      router.push(`/${locale}/forum/discussion/${thread.slug}`);
    } catch {
      setErrors({ general: isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}/forum`} className="hover:text-green-700">{isRTL ? 'المنتدى' : 'Forum'}</Link>
          <span>›</span>
          <span className="text-gray-900">{t('newThreadTitle')}</span>
        </nav>

        <div className="bg-white rounded-xl border p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">{t('newThreadTitle')}</h1>

          {errors.general && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{errors.general}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('categoryLabel')} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all border-2 ${form.categoryId === cat.id ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                    style={form.categoryId === cat.id ? { backgroundColor: cat.color } : {}}>
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleLabel')} <span className="text-red-500">*</span></label>
              <input type="text" value={form.title}
                onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); if (errors.title) setErrors((errs) => ({ ...errs, title: '' })); }}
                placeholder={t('titlePlaceholder')}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
                maxLength={150} />
              <div className="flex justify-between mt-1">
                {errors.title ? <p className="text-red-500 text-xs">{errors.title}</p> : <span />}
                <p className="text-xs text-gray-400">{form.title.length}/150</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('contentLabel')} <span className="text-red-500">*</span></label>
              <textarea value={form.content}
                onChange={(e) => { setForm((f) => ({ ...f, content: e.target.value })); if (errors.content) setErrors((errs) => ({ ...errs, content: '' })); }}
                placeholder={t('contentPlaceholder')} rows={8}
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y text-sm ${errors.content ? 'border-red-300' : 'border-gray-300'}`}
                maxLength={5000} />
              <div className="flex justify-between mt-1">
                {errors.content ? <p className="text-red-500 text-xs">{errors.content}</p> : <span />}
                <p className={`text-xs ${form.content.length > 4500 ? 'text-orange-500' : 'text-gray-400'}`}>{form.content.length}/5000</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-2">
              <Link href={`/${locale}/forum`} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm">{t('cancel')}</Link>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 disabled:opacity-50 flex items-center gap-2 text-sm">
                {submitting ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('publishing')}</>) : t('publish')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
