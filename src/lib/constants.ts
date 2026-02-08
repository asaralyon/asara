// Catégories uniformisées pour tout le projet
export const CATEGORIES = [
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

// Fonction pour traduire une catégorie (gère les anciennes valeurs)
export function translateCategory(category: string, locale: string): string {
  // Mapping des anciennes valeurs vers les nouvelles
  const normalizeMap: Record<string, string> = {
    'Sante': 'Santé',
    'Education': 'Éducation',
    'Beaute': 'Beauté',
    'Beaute et Bien-etre': 'Beauté',
    'Batiment': 'Construction',
    'Informatique': 'Technologie',
  };

  const normalized = normalizeMap[category] || category;
  const found = CATEGORIES.find(c => c.value === normalized);
  
  if (found) {
    return locale === 'ar' ? found.labelAr : found.labelFr;
  }
  
  return category;
}