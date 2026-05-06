'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface EditAccountFormProps {
  user: any;
  locale: string;
}

export default function EditAccountForm({ user, locale }: EditAccountFormProps) {
  const router = useRouter();
  const t = useTranslations('account');
  const isRTL = locale === 'ar';

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    postalCode: user.postalCode || '',
    pseudo: user.pseudo || '',
    pseudo: user.pseudo || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/mon-compte`);
      }, 1500);
    } catch (err) {
      setError(isRTL ? 'حدث خطأ في التحديث' : 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ✅ Bouton retour en haut */}
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
        <Link 
          href={`/${locale}/mon-compte`}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isRTL ? 'rotate-180' : ''}>
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="font-medium">{isRTL ? 'رجوع' : 'Retour'}</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg text-sm border border-green-200">
          {isRTL ? 'تم التحديث بنجاح!' : 'Mise à jour réussie !'}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="label">
            {t('firstName')}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="label">
            {t('lastName')}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className="label">
            {t('phone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="label">
            {t('address')}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="city" className="label">
            {t('city')}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="label">
            {t('postalCode')}
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Pseudo messagerie */}
      <div className="sm:col-span-2 border-t border-neutral-200 pt-6">
        <label htmlFor="pseudo" className="label font-semibold">
          {isRTL ? 'الاسم المستعار (للرسائل)' : 'Pseudo (pour les messages)'}
        </label>
        <p className="text-xs text-neutral-500 mb-2">
          {isRTL
            ? 'اختياري — سيظهر بدلاً من اسمك الحقيقي في المراسلات والمنتدى'
            : 'Optionnel — sera affiché à la place de votre nom dans les messages et le forum'}
        </p>
        <input
          type="text"
          id="pseudo"
          name="pseudo"
          value={formData.pseudo}
          onChange={handleChange}
          className="input"
          maxLength={30}
          placeholder={isRTL ? 'مثال: أبو علي، سارة123' : 'Ex: Safwan123, Sara_Lyon'}
          pattern="[a-zA-Z0-9_\u0600-\u06FF\s]{2,30}"
          title={isRTL ? '2-30 حرف، أحرف وأرقام فقط' : '2-30 caractères, lettres et chiffres uniquement'}
        />
        <p className="text-xs text-neutral-400 mt-1">
          {formData.pseudo.length}/30 — {isRTL ? 'حروف، أرقام و _ مسموح' : 'Lettres, chiffres et _ autorisés'}
        </p>
      </div>

      {/* Pseudo messagerie */}
      <div className="sm:col-span-2 border-t pt-4">
        <label htmlFor="pseudo" className="label">
          {isRTL ? 'الاسم المستعار (اختياري)' : 'Pseudo (optionnel)'}
        </label>
        <input
          type="text"
          id="pseudo"
          name="pseudo"
          value={formData.pseudo}
          onChange={handleChange}
          className="input"
          maxLength={30}
          placeholder={isRTL ? 'اسم مستعار للمراسلة والمنتدى' : 'Nom affiché dans les messages et le forum'}
        />
        <p className="text-xs text-neutral-500 mt-1">
          {isRTL
            ? 'إذا تركته فارغاً سيظهر اسمك الأول فقط'
            : 'Si vide, seul votre prénom sera affiché. Doit être unique.'}
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? t('saving') : t('save')}
        </button>
        <Link
          href={`/${locale}/mon-compte`}
          className="px-6 py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors text-center font-medium"
        >
          {isRTL ? 'إلغاء' : 'Annuler'}
        </Link>
      </div>
    </form>
  );
}
