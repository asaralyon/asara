#!/bin/bash
set -e

echo "🌙 Migration arabe vers 'دليل السوريين في فرنسا'"
echo "================================================="

# Backup
echo "📦 Backup..."
git add . && git commit -m "backup pre-arabic-migration" || true

# Remplacements principaux
echo "🔄 Remplacements en cours..."

# JSON translations
sed -i "s/جمعية السوريين في أوفيرن رون ألب/دليل السوريين في فرنسا/g" src/messages/ar.json 2>/dev/null || true

# CGU page (AR section)
sed -i "s/جمعية السوريين في أوفيرن رون ألب/دليل السوريين في فرنسا/g" src/app/[locale]/cgu/page.tsx
sed -i "s/(ASARA Lyon)/(ASARA)/g" src/app/[locale]/cgu/page.tsx
sed -i "s/ليون، فرنسا/فرنسا/g" src/app/[locale]/cgu/page.tsx

# Page metadata AR
sed -i "s/جمعية السوريين في أوفيرن رون ألب | ASARA Lyon/دليل السوريين في فرنسا | ASARA/g" src/app/[locale]/page.tsx

# Emails AR
sed -i "s/فريق ASARA Lyon/فريق ASARA/g" src/app/api/subscribe/route.ts
sed -i "s/النشرة الأسبوعية - ASARA Lyon/النشرة الأسبوعية - ASARA/g" src/app/api/subscribe/route.ts
sed -i "s/النشرة الأسبوعية - ASARA Lyon/النشرة الأسبوعية - ASARA/g" src/app/api/newsletter/send/route.ts
sed -i "s/النشرة الأسبوعية - ASARA Lyon/النشرة الأسبوعية - ASARA/g" src/app/api/newsletter/pdf/route.ts

# SEO JsonLd
sed -i "s/جمعية السوريين في أوفيرن رون ألب/دليل السوريين في فرنسا/g" src/components/seo/JsonLd.tsx

# Layout keywords
sed -i "s/'المجتمع السوري'،'ليون'/'المجتمع السوري'،'فرنسا'/g" src/app/[locale]/layout.tsx

# Forum title
sed -i 's/"Forum ASARA Lyon"/"Forum ASARA"/g' src/messages/fr.json

# Generic ASARA Lyon → ASARA dans tous les fichiers TSX/TS
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/ASARA Lyon/ASARA/g" {} +

echo ""
echo "✅ Remplacements arabes terminés !"
echo ""
echo "🔍 Vérification..."

# Vérifications
AR_OLD=$(grep -rn "جمعية السوريين في أوفيرن" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
AR_LYON=$(grep -rn "ليون" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | grep -v "cities.ts" | wc -l)
AR_NEW=$(grep -rn "دليل السوريين في فرنسا" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)

echo "  • Anciennes références AR : $AR_OLD (doit être 0)"
echo "  • 'ليون' restants (hors villes) : $AR_LYON (doit être 0)"  
echo "  • Nouvelles références AR : $AR_NEW (doit être > 0)"

if [ "$AR_OLD" -eq 0 ] && [ "$AR_LYON" -eq 0 ] && [ "$AR_NEW" -gt 0 ]; then
  echo ""
  echo "🎉 Migration arabe réussie ! ✅"
else
  echo ""
  echo "⚠️  Vérifiez manuellement les résultats ci-dessus."
fi

echo ""
echo "💡 Prochaines étapes :"
echo "  1. npm run build"
echo "  2. npm run dev (tester en arabe : /ar)"
echo "  3. git add . && git commit -m 'migration arabe France' && git push"
