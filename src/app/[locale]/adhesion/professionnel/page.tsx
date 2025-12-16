'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// Catégories uniformisées
const CATEGORIES = [
  { value: 'Santé', labelFr: 'Santé', labelAr: 'الصحة' },
  { value: 'Juridique', labelFr: 'Juridique', labelAr: 'القانون' },
  { value: 'Finance', labelFr: 'Finance', labelAr: 'المالية' },
  { value: 'Immobilier', labelFr: 'Immobilier', labelAr: 'العقارات' },
  { value: 'Restauration', labelFr: 'Restauration', labelAr: 'المطاعم' },
  { value: 'Commerce', labelFr: 'Commerce', labelAr: 'التجارة' },
  { value: 'Artisanat', labelFr: 'Artisanat', labelAr: 'الحرف' },
  { value: 'Technologie', labelFr: 'Technologie', labelAr: 'التكنولوجيا' },
  { value: 'Éducation', labelFr: 'Éducation', labelAr: 'التعليم' },
  { value: 'Transport', labelFr: 'Transport', labelAr: 'النقل' },
  { value: 'Beauté', labelFr: 'Beauté & Bien-être', labelAr: 'الجمال' },
  { value: 'Construction', labelFr: 'Construction', labelAr: 'البناء' },
  { value: 'Autre', labelFr: 'Autre', labelAr: 'أخرى' },
];

// Villes d'Auvergne-Rhône-Alpes
const CITIES = [
  'Aix-les-Bains', 'Albertville', 'Ambérieu-en-Bugey', 'Ambert', 'Andrézieux-Bouthéon', 'Annecy', 'Annemasse', 'Annonay', 'Archamps', 'Arpajon-sur-Cère',
  'Aubenas', 'Aubière', 'Aurec-sur-Loire', 'Aurillac',
  'Beaumont', 'Bellegarde-sur-Valserine', 'Bellerive-sur-Allier', 'Belley', 'Bonneville', 'Bourg-en-Bresse', 'Bourg-lès-Valence', 'Bourg-Saint-Andéol', 'Bourg-Saint-Maurice', 'Bourgoin-Jallieu', 'Brioude', 'Bron',
  'Caluire-et-Cuire', 'Chamalières', 'Chambéry', 'Clermont-Ferrand', 'Cluses', 'Cognin', 'Commentry', 'Cournon-d\'Auvergne', 'Cran-Gevrier', 'Craponne-sur-Arzon', 'Crest', 'Cusset',
  'Décines-Charpieu', 'Désertines', 'Die', 'Divonne-les-Bains', 'Dompierre-sur-Besbre',
  'Échirolles', 'Évian-les-Bains',
  'Ferney-Voltaire', 'Firminy', 'Fontaine',
  'Gaillard', 'Gannat', 'Gerzat', 'Gex', 'Givors', 'Grenoble', 'Guilherand-Granges',
  'Issoire',
  'L\'Isle-d\'Abeau', 'La Motte-Servolex', 'La Tour-du-Pin', 'La Voulte-sur-Rhône', 'Langeac', 'Le Chambon-Feugerolles', 'Le Puy-en-Velay', 'Le Teil', 'Lempdes', 'Livron-sur-Drôme', 'Lyon',
  'Mauriac', 'Maurs', 'Meximieux', 'Meylan', 'Meyzieu', 'Miribel', 'Modane', 'Monistrol-sur-Loire', 'Montbrison', 'Montélimar', 'Montluçon', 'Montmélian', 'Moulins', 'Murat',
  'Oullins', 'Oyonnax',
  'Passy', 'Pierrelatte', 'Pont-du-Château', 'Portes-lès-Valence', 'Privas',
  'Rillieux-la-Pape', 'Riom', 'Riom-ès-Montagnes', 'Riorges', 'Rive-de-Gier', 'Roanne', 'Romans-sur-Isère', 'Roussillon', 'Rumilly',
  'Saint-Chamond', 'Saint-Étienne', 'Saint-Flour', 'Saint-Germain-Laprade', 'Saint-Jean-de-Maurienne', 'Saint-Julien-en-Genevois', 'Saint-Just-Saint-Rambert', 'Saint-Martin-d\'Hères', 'Saint-Paul-Trois-Châteaux', 'Saint-Péray', 'Saint-Priest', 'Sainte-Sigolène', 'Sallanches', 'Sassenage', 'Seynod',
  'Tarare', 'Tassin-la-Demi-Lune', 'Thiers', 'Thonon-les-Bains', 'Tournon-sur-Rhône',
  'Ugine',
  'Valence', 'Vals-les-Bains', 'Vals-près-le-Puy', 'Vaulx-en-Velin', 'Vénissieux', 'Vic-sur-Cère', 'Vichy', 'Vienne', 'Vif', 'Villefontaine', 'Villeurbanne', 'Voiron',
  'Ydes', 'Yssingeaux', 'Ytrac', 'Yzeure',
];

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.register');
  const isRTL = locale === 'ar';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    profession: '',
    category: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    professionalPhone: '',
    professionalEmail: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      if (step === 1 && formData.password !== formData.confirmPassword) {
        setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Les mots de passe ne correspondent pas');
        return;
      }
      setStep(step + 1);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'PROFESSIONAL',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/' + locale + '/adhesion/success');
      } else {
        setError(data.error || (isRTL ? 'خطأ في التسجيل' : 'Erreur lors de l\'inscription'));
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال' : 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="section bg-neutral-50 min-h-screen">
        <div className="container-app max-w-2xl">
          <div className="mb-8">
            <Link
              href={'/' + locale + '/adhesion'}
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'العودة' : 'Retour'}
            </Link>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'التسجيل كمحترف' : 'Inscription Professionnel'}
            </h1>
            <p className="text-neutral-600 mt-2">
              {isRTL ? 'الخطوة' : 'Étape'} {step}/3
            </p>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary-500' : 'bg-neutral-200'}`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">
                  {isRTL ? 'المعلومات الشخصية' : 'Informations personnelles'}
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('firstName')} *</label>
                    <input type="text" required value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input" />
                  </div>
                  <div>
                    <label className="label">{t('lastName')} *</label>
                    <input type="text" required value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">{t('email')} *</label>
                  <input type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="label">{t('phone')}</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="label">{t('password')} *</label>
                  <input type="password" required minLength={8} value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="label">{t('confirmPassword')} *</label>
                  <input type="password" required minLength={8} value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">
                  {isRTL ? 'المعلومات المهنية' : 'Informations professionnelles'}
                </h2>

                <div>
                  <label className="label">{isRTL ? 'اسم الشركة' : 'Nom de l\'entreprise'}</label>
                  <input type="text" value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="input" placeholder={isRTL ? 'اختياري' : 'Optionnel'} />
                </div>

                <div>
                  <label className="label">{isRTL ? 'المهنة' : 'Métier / Profession'} *</label>
                  <input type="text" required value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="input" placeholder={isRTL ? 'مثال: طبيب أسنان، محامي...' : 'Ex: Dentiste, Avocat, Développeur...'} />
                </div>

                <div>
                  <label className="label">{isRTL ? 'الفئة' : 'Catégorie'} *</label>
                  <select required value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input">
                    <option value="">{isRTL ? 'اختر فئة' : 'Sélectionnez une catégorie'}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {isRTL ? cat.labelAr : cat.labelFr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">{isRTL ? 'الوصف' : 'Description'}</label>
                  <textarea rows={4} value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input" placeholder={isRTL ? 'وصف مختصر لنشاطك' : 'Décrivez brièvement votre activité'} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">
                  {isRTL ? 'بيانات الاتصال المهنية' : 'Coordonnées professionnelles'}
                </h2>

                <div>
                  <label className="label">{isRTL ? 'العنوان' : 'Adresse'}</label>
                  <input type="text" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{isRTL ? 'المدينة' : 'Ville'} *</label>
                    <select required value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="input">
                      <option value="">{isRTL ? 'اختر مدينة' : 'Sélectionnez une ville'}</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">{isRTL ? 'الرمز البريدي' : 'Code postal'}</label>
                    <input type="text" value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">{isRTL ? 'هاتف العمل' : 'Téléphone professionnel'}</label>
                  <input type="tel" value={formData.professionalPhone}
                    onChange={(e) => setFormData({ ...formData, professionalPhone: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="label">{isRTL ? 'البريد الإلكتروني المهني' : 'Email professionnel'}</label>
                  <input type="email" value={formData.professionalEmail}
                    onChange={(e) => setFormData({ ...formData, professionalEmail: e.target.value })}
                    className="input" />
                </div>

                <div>
                  <label className="label">{isRTL ? 'الموقع الإلكتروني' : 'Site web'}</label>
                  <input type="url" value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="input" placeholder="https://..." />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-100">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                  {isRTL ? 'السابق' : 'Précédent'}
                </button>
              ) : <div />}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />{isRTL ? 'جاري التحميل...' : 'Chargement...'}</>
                ) : step < 3 ? (isRTL ? 'التالي' : 'Suivant') : (isRTL ? 'إرسال' : 'Envoyer')}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-primary-50 rounded-xl text-center">
            <p className="text-primary-700 font-medium">
              {isRTL ? 'رسوم العضوية: 100 يورو / سنة' : 'Cotisation : 100 € / an'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
