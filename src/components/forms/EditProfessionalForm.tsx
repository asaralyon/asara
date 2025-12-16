'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

interface EditProfessionalFormProps {
  user: any;
  locale: string;
}

export default function EditProfessionalForm({ user, locale }: EditProfessionalFormProps) {
  const router = useRouter();
  const isRTL = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: user.profile?.companyName || '',
    profession: user.profile?.profession || '',
    category: user.profile?.category || '',
    description: user.profile?.description || '',
    address: user.profile?.address || '',
    city: user.profile?.city || '',
    postalCode: user.profile?.postalCode || '',
    professionalPhone: user.profile?.professionalPhone || '',
    professionalEmail: user.profile?.professionalEmail || '',
    website: user.profile?.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/update-professional', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/' + locale + '/mon-compte'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
        <Link href={'/' + locale + '/mon-compte'} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-lg font-semibold">{isRTL ? 'تعديل المعلومات المهنية' : 'Modifier les informations professionnelles'}</h2>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 rounded-lg">{isRTL ? 'تم التحديث بنجاح!' : 'Mise à jour réussie !'}</div>}

      <div>
        <label className="label">{isRTL ? 'اسم الشركة' : 'Nom de l\'entreprise'}</label>
        <input type="text" value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          className="input" />
      </div>

      <div>
        <label className="label">{isRTL ? 'المهنة' : 'Profession'} *</label>
        <input type="text" required value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          className="input" />
      </div>

      <div>
        <label className="label">{isRTL ? 'الفئة' : 'Catégorie'} *</label>
        <select required value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="input">
          <option value="">{isRTL ? 'اختر فئة' : 'Sélectionnez'}</option>
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
          className="input" />
      </div>

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
            <option value="">{isRTL ? 'اختر مدينة' : 'Sélectionnez'}</option>
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
        <label className="label">{isRTL ? 'هاتف العمل' : 'Téléphone pro'}</label>
        <input type="tel" value={formData.professionalPhone}
          onChange={(e) => setFormData({ ...formData, professionalPhone: e.target.value })}
          className="input" />
      </div>

      <div>
        <label className="label">{isRTL ? 'البريد الإلكتروني المهني' : 'Email pro'}</label>
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

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {isRTL ? 'جاري الحفظ...' : 'Enregistrement...'}</> : (isRTL ? 'حفظ التغييرات' : 'Enregistrer')}
      </button>
    </form>
  );
}
