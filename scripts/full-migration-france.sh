#!/bin/bash
set -e

echo "🚀 Migration complète vers 'Annuaire des Syriens de France'"
echo "==========================================================="

# Backup
echo "📦 Backup..."
git add . && git commit -m "backup pre-migration" || true

# Remplacements
echo "🔄 Remplacements en cours..."

FILES=(
  "src/app/[locale]/layout.tsx"
  "src/app/[locale]/page.tsx"
  "src/app/[locale]/cgu/page.tsx"
  "src/app/[locale]/adhesion/page.tsx"
  "src/app/[locale]/newsletter/page.tsx"
  "src/app/[locale]/annuaire-associations/page.tsx"
  "src/app/[locale]/annuaire-associations/[slug]/page.tsx"
  "src/app/[locale]/admin/newsletter/page.tsx"
  "src/components/seo/JsonLd.tsx"
  "src/lib/email.ts"
  "src/app/api/subscribe/route.ts"
  "src/app/api/admin/send-campaign/route.ts"
  "src/app/api/contact/route.ts"
  "src/app/api/newsletter/send/route.ts"
  "src/app/api/newsletter/pdf/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  → $file"
    sed -i "s/Association des Syriens d'Auvergne Rhône-Alpes/Annuaire des Syriens de France/g" "$file"
    sed -i "s/Association des Syriens d'Auvergne Rhone-Alpes/Annuaire des Syriens de France/g" "$file"
    sed -i "s/ASARA Lyon/ASARA/g" "$file"
    sed -i "s/www.asara-lyon.fr/www.asara-france.fr/g" "$file" 2>/dev/null || true
  fi
done

# JSON
sed -i 's/"Forum ASARA Lyon"/"Forum ASARA"/g' src/messages/fr.json

# Layout keywords spécifiques
sed -i "s/'Lyon', 'Auvergne-Rhône-Alpes'/'France'/g" src/app/[locale]/layout.tsx
sed -i "s/addressRegion: 'Auvergne-Rhône-Alpes'/addressRegion: 'France'/g" src/components/seo/JsonLd.tsx

echo ""
echo "✅ Remplacements terminés !"
echo ""
echo "🔍 Vérification..."
RESTER=$(grep -rn "Association des Syriens d'Auvergne" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
if [ "$RESTER" -eq 0 ]; then
  echo "✅ Aucune ancienne référence trouvée !"
else
  echo "⚠️  Il reste $RESTER occurrence(s) à vérifier manuellement."
fi

echo ""
echo "💡 Prochaines étapes :"
echo "  1. npm run build"
echo "  2. npm run dev (pour tester)"
echo "  3. git add . && git commit -m 'migration France' && git push"
