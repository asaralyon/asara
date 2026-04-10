'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, AlertCircle, Eye, EyeOff,
  Building, Phone, Mail, Globe, Hash, Activity,
  Facebook, Instagram, CheckCircle,
} from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

const FRENCH_CITIES = [
  'Aix-en-Provence', 'Amiens', 'Angers', 'Annecy', 'Annemasse', 'Argenteuil',
  'Besançon', 'Bordeaux', 'Boulogne-Billancourt', 'Brest', 'Caen',
  'Clermont-Ferrand', 'Dijon', 'Grenoble', 'Le Havre', 'Le Mans',
  'Lille', 'Limoges', 'Lyon', 'Marseille', 'Metz', 'Montpellier',
  'Mulhouse', 'Nancy', 'Nantes', 'Nice', 'Nîmes', 'Paris',
  'Perpignan', 'Reims', 'Rennes', 'Rouen', 'Saint-Denis',
  'Saint-Étienne', 'Strasbourg', 'Toulon', 'Toulouse', 'Tours',
  'Villeurbanne', 'Albertville', 'Ambérieu-en-Bugey', 'Annonay',
  'Aubenas', 'Aurillac', 'Bourgoin-Jallieu', 'Bourg-en-Bresse',
  'Chambéry', 'Décines-Charpieu', 'Échirolles', 'Firminy',
  'Montélimar', 'Montluçon', 'Moulins', 'Oyonnax', 'Roanne',
  'Romans-sur-Isère', 'Saint-Chamond', 'Saint-Priest', 'Valence',
  'Vaulx-en-Velin', 'Vénissieux', 'Vichy', 'Vienne', 'Voiron',
].sort((a, b) => a.localeCompare(b, 'fr'));

export default function AssociationSignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [step, setStep] = useState(1);
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
    associationName: '',
    registrationNumber: '',
    activities: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    assocPhone: '',
    assocEmail: '',
    website: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    whatsappUrl: '',
  });

  const set = (field: string, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
        return;
      }
      if (formData.password.length < 8) {
        setError(isRTL ? '8 أحرف على الأقل' : 'Minimum 8 caractères');
        return;
      }
    }
    if (step === 2 && !formData.associationName.trim()) {
      setError(isRTL ? 'اسم الجمعية مطلوب' : "Le nom de l'association est requis");
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'ASSOCIATION' }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/${locale}/adhesion/success`);
      } else {
        setError(data.error || (isRTL ? 'خطأ في التسجيل' : "Erreur lors de l'inscription"));
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    }
    setLoading(false);
  };

  const stepTitles = isRTL
    ? ['معلومات الحساب', 'معلومات الجمعية', 'الاتصال والشبكات']
    : ['Informations du compte', "Informations de l'association", 'Contact & Réseaux sociaux'];

  const stepIcons = ['👤', '🏛️', '📞'];

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <section className="section">
        <div className="container-app max-w-2xl">

          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/${locale}/adhesion`}
              className={`inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              {isRTL ? 'العودة' : 'Retour'}
            </Link>
            <h1 className={`text-2xl font-bold ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'تسجيل جمعية' : 'Inscription Association'}
            </h1>
            <p className={`text-neutral-600 mt-1 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? `الخطوة ${step} من 3` : `Étape ${step} sur 3`}
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 relative">
                <div className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary-500' : 'bg-neutral-200'}`} />
              </div>
            ))}
          </div>

          {/* Step label */}
          <div className={`flex items-center gap-2 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-2xl">{stepIcons[step - 1]}</span>
            <p className="text-sm font-semibold text-primary-600">
              {stepTitles[step - 1]}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className={`flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={step < 3 ? handleNext : handleSubmit} className="card space-y-5">

            {/* ── STEP 1 : Compte ── */}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{isRTL ? 'الاسم' : 'Prénom'} *</label>
                    <input
                      type="text" required value={formData.firstName}
                      onChange={(e) => set('firstName', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">{isRTL ? 'اللقب' : 'Nom'} *</label>
                    <input
                      type="text" required value={formData.lastName}
                      onChange={(e) => set('lastName', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">{isRTL ? 'البريد الإلكتروني' : 'Email'} *</label>
                  <input
                    type="email" required value={formData.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="input" dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">{isRTL ? 'الهاتف' : 'Téléphone'}</label>
                  <input
                    type="tel" value={formData.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="input" dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">{isRTL ? 'كلمة المرور' : 'Mot de passe'} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required minLength={8}
                      value={formData.password}
                      onChange={(e) => set('password', e.target.value)}
                      className="input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400"
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
                  <label className="label">{isRTL ? 'تأكيد كلمة المرور' : 'Confirmer le mot de passe'} *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      className="input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2 : Association ── */}
            {step === 2 && (
              <>
                <div>
                  <label className="label">
                    <Building className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'اسم الجمعية' : "Nom de l'association"} *
                  </label>
                  <input
                    type="text" required value={formData.associationName}
                    onChange={(e) => set('associationName', e.target.value)}
                    className="input"
                    placeholder={isRTL ? 'الاسم الكامل للجمعية' : "Nom officiel de l'association"}
                  />
                </div>
                <div>
                  <label className="label">
                    <Hash className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'رقم التسجيل (RNA / SIRET)' : 'N° d\'enregistrement (RNA / SIRET)'}
                  </label>
                  <input
                    type="text" value={formData.registrationNumber}
                    onChange={(e) => set('registrationNumber', e.target.value)}
                    className="input font-mono"
                    placeholder="W751234567 ou 123 456 789 00012"
                    dir="ltr"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {isRTL ? 'رقم RNA أو SIRET (اختياري)' : 'Numéro RNA ou SIRET (optionnel)'}
                  </p>
                </div>
                <div>
                  <label className="label">
                    <Activity className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'أنشطة الجمعية' : "Activités de l'association"} *
                  </label>
                  <textarea
                    required rows={4} value={formData.activities}
                    onChange={(e) => set('activities', e.target.value)}
                    className="input resize-none"
                    placeholder={isRTL
                      ? 'صف الأنشطة الرئيسية لجمعيتك...'
                      : 'Décrivez les activités principales de votre association...'}
                  />
                </div>
                <div>
                  <label className="label">
                    {isRTL ? 'وصف الجمعية' : 'Description'}
                  </label>
                  <textarea
                    rows={3} value={formData.description}
                    onChange={(e) => set('description', e.target.value)}
                    className="input resize-none"
                    placeholder={isRTL ? 'معلومات إضافية...' : 'Informations complémentaires...'}
                  />
                </div>
              </>
            )}

            {/* ── STEP 3 : Contact & Réseaux ── */}
            {step === 3 && (
              <>
                <div>
                  <label className="label">{isRTL ? 'العنوان' : 'Adresse'}</label>
                  <input
                    type="text" value={formData.address}
                    onChange={(e) => set('address', e.target.value)}
                    className="input"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{isRTL ? 'المدينة' : 'Ville'} *</label>
                    <select
                      required value={formData.city}
                      onChange={(e) => set('city', e.target.value)}
                      className="input"
                    >
                      <option value="">{isRTL ? 'اختر مدينة' : 'Sélectionnez'}</option>
                      {FRENCH_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">{isRTL ? 'الرمز البريدي' : 'Code postal'}</label>
                    <input
                      type="text" value={formData.postalCode}
                      onChange={(e) => set('postalCode', e.target.value)}
                      className="input" dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">
                    <Phone className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'هاتف الجمعية' : "Téléphone de l'association"}
                  </label>
                  <input
                    type="tel" value={formData.assocPhone}
                    onChange={(e) => set('assocPhone', e.target.value)}
                    className="input" dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">
                    <Mail className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'البريد الإلكتروني للجمعية' : "Email de l'association"}
                  </label>
                  <input
                    type="email" value={formData.assocEmail}
                    onChange={(e) => set('assocEmail', e.target.value)}
                    className="input" dir="ltr"
                  />
                </div>
                <div>
                  <label className="label">
                    <Globe className="w-4 h-4 inline mr-1 text-primary-500" />
                    {isRTL ? 'الموقع الإلكتروني' : 'Site web'}
                  </label>
                  <input
                    type="url" value={formData.website}
                    onChange={(e) => set('website', e.target.value)}
                    className="input" placeholder="https://..." dir="ltr"
                  />
                </div>

                {/* Réseaux sociaux */}
                <div className="pt-4 border-t border-neutral-100">
                  <p className={`text-sm font-semibold text-neutral-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'وسائل التواصل الاجتماعي' : 'Réseaux sociaux'}
                  </p>
                  <div className="space-y-3">
                    {/* Facebook */}
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Facebook className="w-5 h-5" />
                      </div>
                      <input
                        type="url" value={formData.facebookUrl}
                        onChange={(e) => set('facebookUrl', e.target.value)}
                        className="input flex-1"
                        placeholder="https://facebook.com/votre-association"
                        dir="ltr"
                      />
                    </div>
                    {/* Instagram */}
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <input
                        type="url" value={formData.instagramUrl}
                        onChange={(e) => set('instagramUrl', e.target.value)}
                        className="input flex-1"
                        placeholder="https://instagram.com/votre-association"
                        dir="ltr"
                      />
                    </div>
                    {/* TikTok */}
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <TikTokIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="url" value={formData.tiktokUrl}
                        onChange={(e) => set('tiktokUrl', e.target.value)}
                        className="input flex-1"
                        placeholder="https://tiktok.com/@votre-association"
                        dir="ltr"
                      />
                      {/* WhatsApp */}
<div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </div>
  <input
    type="url" value={formData.whatsappUrl}
    onChange={(e) => set('whatsappUrl', e.target.value)}
    className="input flex-1"
    placeholder="https://chat.whatsapp.com/..."
    dir="ltr"
  />
</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className={`flex justify-between pt-4 border-t border-neutral-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => { setStep(step - 1); setError(''); }}
                  className="btn-secondary"
                >
                  {isRTL ? '→ السابق' : '← Précédent'}
                </button>
              ) : <div />}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {isRTL ? 'جاري...' : 'Envoi...'}</>
                ) : step < 3 ? (
                  isRTL ? '← التالي' : 'Suivant →'
                ) : (
                  <><CheckCircle className="w-5 h-5" /> {isRTL ? 'إرسال الطلب' : 'Envoyer ma demande'}</>
                )}
              </button>
            </div>
          </form>

          {/* Note gratuit */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl text-center border border-green-200">
            <p className="text-green-700 font-medium text-sm">
              ✅ {isRTL ? 'التسجيل في الدليل مجاني تماماً' : 'Le référencement dans l\'annuaire est totalement gratuit'}
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}