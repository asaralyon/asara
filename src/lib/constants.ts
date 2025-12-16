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

// Villes d'Auvergne-Rhône-Alpes
export const CITIES = [
  // Ain (01)
  'Bourg-en-Bresse', 'Oyonnax', 'Ambérieu-en-Bugey', 'Bellegarde-sur-Valserine', 'Gex', 'Ferney-Voltaire', 'Divonne-les-Bains', 'Belley', 'Meximieux', 'Miribel',
  // Allier (03)
  'Moulins', 'Montluçon', 'Vichy', 'Cusset', 'Yzeure', 'Bellerive-sur-Allier', 'Commentry', 'Gannat', 'Dompierre-sur-Besbre', 'Désertines',
  // Ardèche (07)
  'Annonay', 'Aubenas', 'Guilherand-Granges', 'Tournon-sur-Rhône', 'Privas', 'Le Teil', 'Bourg-Saint-Andéol', 'La Voulte-sur-Rhône', 'Saint-Péray', 'Vals-les-Bains',
  // Cantal (15)
  'Aurillac', 'Saint-Flour', 'Mauriac', 'Arpajon-sur-Cère', 'Riom-ès-Montagnes', 'Ytrac', 'Murat', 'Ydes', 'Vic-sur-Cère', 'Maurs',
  // Drôme (26)
  'Valence', 'Romans-sur-Isère', 'Montélimar', 'Pierrelatte', 'Bourg-lès-Valence', 'Portes-lès-Valence', 'Saint-Paul-Trois-Châteaux', 'Livron-sur-Drôme', 'Crest', 'Die',
  // Isère (38)
  'Grenoble', 'Vienne', 'Échirolles', 'Bourgoin-Jallieu', 'Fontaine', 'Voiron', 'Saint-Martin-d\'Hères', 'Villefontaine', 'Meylan', 'L\'Isle-d\'Abeau', 'Sassenage', 'Vif', 'Roussillon', 'La Tour-du-Pin',
  // Loire (42)
  'Saint-Étienne', 'Roanne', 'Saint-Chamond', 'Firminy', 'Montbrison', 'Rive-de-Gier', 'Riorges', 'Le Chambon-Feugerolles', 'Saint-Just-Saint-Rambert', 'Andrézieux-Bouthéon',
  // Haute-Loire (43)
  'Le Puy-en-Velay', 'Monistrol-sur-Loire', 'Yssingeaux', 'Brioude', 'Sainte-Sigolène', 'Langeac', 'Vals-près-le-Puy', 'Craponne-sur-Arzon', 'Saint-Germain-Laprade', 'Aurec-sur-Loire',
  // Puy-de-Dôme (63)
  'Clermont-Ferrand', 'Riom', 'Cournon-d\'Auvergne', 'Chamalières', 'Aubière', 'Beaumont', 'Issoire', 'Thiers', 'Gerzat', 'Pont-du-Château', 'Ambert', 'Lempdes',
  // Rhône (69)
  'Lyon', 'Villeurbanne', 'Vénissieux', 'Vaulx-en-Velin', 'Caluire-et-Cuire', 'Bron', 'Rillieux-la-Pape', 'Saint-Priest', 'Oullins', 'Meyzieu', 'Décines-Charpieu', 'Givors', 'Tassin-la-Demi-Lune', 'Tarare',
  // Savoie (73)
  'Chambéry', 'Aix-les-Bains', 'Albertville', 'La Motte-Servolex', 'Saint-Jean-de-Maurienne', 'Bourg-Saint-Maurice', 'Montmélian', 'Cognin', 'Ugine', 'Modane',
  // Haute-Savoie (74)
  'Annecy', 'Thonon-les-Bains', 'Annemasse', 'Évian-les-Bains', 'Cluses', 'Seynod', 'Rumilly', 'Sallanches', 'Bonneville', 'Cran-Gevrier', 'Passy', 'Gaillard', 'Saint-Julien-en-Genevois', 'Archamps',
].sort((a, b) => a.localeCompare(b, 'fr'));
