'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import CityAutocomplete from '@/components/CityAutocomplete';

export default function MemberSignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.register');
  const isRTL = locale === 'ar';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError(isRTL ? 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل' : 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          role: 'MEMBER',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/' + locale + '/adhesion/success');
      } else {
        setError(data.error || (isRTL ? 'خطأ في التسجيل' : "Erreur lors de l'inscription"));
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    }

    setLoading(false);
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="section bg-neutral-50 min-h-screen">
        <div className="container-app">
          <Link
            href={'/' + locale + '/adhesion'}
            className={'inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-6 ' + (isRTL ? 'flex-row-reverse' : '')}
          >
            <ArrowLeft className={'w-4 h-4 ' + (isRTL ? 'rotate-180' : '')} />
            {isRTL ? 'رجوع' : 'Retour'}
          </Link>

          <div className="max-w-lg mx-auto">
            <div className="card">
              <h1 className="text-2xl font-bold text-center mb-2">
                {isRTL ? 'عضوية عادية' : 'Adhésion Membre'}
              </h1>
              <p className="text-neutral-600 text-center mb-8">
                {isRTL ? 'انضم إلى مجتمع ASARA' : 'Rejoignez la communauté ASARA'}
              </p>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('firstName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="label">{t('lastName')} *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">{t('email')} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="label">{t('phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="label">{t('password')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {isRTL ? '8 أحرف على الأقل' : 'Minimum 8 caractères'}
                  </p>
                </div>

                <div>
                  <label className="label">{t('confirmPassword')} *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="input pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">{isRTL ? 'العنوان' : 'Adresse'}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <CityAutocomplete
                    value={formData.city}
                    onChange={(city) => setFormData({ ...formData, city })}
                    placeholder={isRTL ? 'ابحث عن مدينة...' : 'Rechercher une ville...'}
                    label={isRTL ? 'المدينة' : 'Ville'}
                    isRTL={isRTL}
                  />

                  <div>
                    <label className="label">{isRTL ? 'الرمز البريدي' : 'Code postal'}</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="input"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isRTL ? 'جاري التسجيل...' : 'Inscription en cours...'}
                    </>
                  ) : (
                    isRTL ? 'إرسال الطلب' : 'Envoyer ma demande'
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-primary-50 rounded-xl text-center">
                <p className="text-primary-700 font-medium">
                  {isRTL ? 'رسوم العضوية: 15 يورو / سنة' : 'Cotisation : 15 € / an'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
