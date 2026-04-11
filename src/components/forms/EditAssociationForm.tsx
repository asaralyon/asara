'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, CheckCircle, AlertCircle,
  Building, Hash, Activity, Phone, Mail,
  Globe, Facebook, Instagram,
} from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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

interface EditAssociationFormProps {
  user: any;
  locale: string;
}

export default function EditAssociationForm({ user, locale }: EditAssociationFormProps) {
  const router = useRouter();
  const isRTL = locale === 'ar';
  const profile = user.associationProfile;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Infos association
    associationName: profile?.associationName || '',
    registrationNumber: profile?.registrationNumber || '',
    activities: profile?.activities || '',
    description: profile?.description || '',
    // Coordonnées
    address: profile?.address || '',
    city: profile?.city || '',
    postalCode: profile?.postalCode || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    // Réseaux sociaux
    facebookUrl: profile?.facebookUrl || '',
    instagramUrl: profile?.instagramUrl || '',
    tiktokUrl: profile?.tiktokUrl || '',
    whatsappUrl: profile?.whatsappUrl || '',
  });

  const set = (field: string, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/user/update-association', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push(`/${locale}/mon-compte/association`), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Bouton retour */}
      <div className={`flex items-center gap-3 pb-4 border-b border-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Link
          href={`/${locale}/mon-compte/association`}
          className={`flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="font-medium">{isRTL ? 'رجوع' : 'Retour'}</span>
        </Link>
      </div>

      {error && (
        <div className={`flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={`flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{isRTL ? 'تم التحديث بنجاح!' : 'Mise à jour réussie !'}</span>
        </div>
      )}

      {/* Section 1 — Infos association */}
      <div className="card space-y-5">
        <h2 className={`font-bold text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Building className="w-5 h-5 text-primary-500" />
          {isRTL ? 'معلومات الجمعية' : "Informations de l'association"}
        </h2>

        <div>
          <label className="label">
            {isRTL ? 'اسم الجمعية' : "Nom de l'association"} *
          </label>
          <input
            type="text" required value={formData.associationName}
            onChange={(e) => set('associationName', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="label">
            <Hash className="w-4 h-4 inline mr-1 text-primary-500" />
            {isRTL ? 'رقم التسجيل (RNA / SIRET)' : "N° d'enregistrement (RNA / SIRET)"}
          </label>
          <input
            type="text" value={formData.registrationNumber}
            onChange={(e) => set('registrationNumber', e.target.value)}
            className="input font-mono"
            placeholder="W751234567 ou 123 456 789 00012"
            dir="ltr"
          />
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
              : 'Décrivez les activités principales...'}
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
      </div>

      {/* Section 2 — Coordonnées */}
      <div className="card space-y-5">
        <h2 className={`font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'بيانات الاتصال' : 'Coordonnées'}
        </h2>

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
            type="tel" value={formData.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="input" dir="ltr"
          />
        </div>

        <div>
          <label className="label">
            <Mail className="w-4 h-4 inline mr-1 text-primary-500" />
            {isRTL ? 'البريد الإلكتروني للجمعية' : "Email de l'association"}
          </label>
          <input
            type="email" value={formData.email}
            onChange={(e) => set('email', e.target.value)}
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
      </div>

      {/* Section 3 — Réseaux sociaux */}
      <div className="card space-y-4">
        <h2 className={`font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'وسائل التواصل الاجتماعي' : 'Réseaux sociaux'}
        </h2>

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
        </div>

        {/* WhatsApp */}
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <WhatsAppIcon className="w-5 h-5" />
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

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {isRTL ? 'جاري الحفظ...' : 'Enregistrement...'}</>
        ) : (
          <><CheckCircle className="w-5 h-5" /> {isRTL ? 'حفظ التغييرات' : 'Enregistrer les modifications'}</>
        )}
      </button>

    </form>
  );
}