#!/bin/bash
echo "🔍 Vérification finale FR/AR"
echo "============================"

echo ""
echo "🇫🇷 Français :"
FR_OLD=$(grep -rn "Association des Syriens d'Auvergne" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
FR_NEW=$(grep -rn "Annuaire des Syriens de France" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
echo "  • Anciennes références : $FR_OLD $(if [ $FR_OLD -eq 0 ]; then echo "✅"; else echo "❌"; fi)"
echo "  • Nouvelles références : $FR_NEW $(if [ $FR_NEW -gt 0 ]; then echo "✅"; else echo "❌"; fi)"

echo ""
echo "🇸🇾 العربية :"
AR_OLD=$(grep -rn "جمعية السوريين في أوفيرن" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
AR_NEW=$(grep -rn "دليل السوريين في فرنسا" --include="*.tsx" --include="*.ts" --include="*.json" src/ 2>/dev/null | wc -l)
echo "  • Anciennes références : $AR_OLD $(if [ $AR_OLD -eq 0 ]; then echo "✅"; else echo "❌"; fi)"
echo "  • Nouvelles références : $AR_NEW $(if [ $AR_NEW -gt 0 ]; then echo "✅"; else echo "❌"; fi)"

echo ""
echo "⚖️  Juridiction légale (doit rester 'ليون' dans CGU) :"
JURIDICTION=$(grep "محاكم ليون" src/app/[locale]/cgu/page.tsx | wc -l)
echo "  • 'محاكم ليون' dans CGU : $JURIDICTION $(if [ $JURIDICTION -ge 1 ]; then echo "✅"; else echo "❌"; fi)"

echo ""
if [ "$FR_OLD" -eq 0 ] && [ "$AR_OLD" -eq 0 ] && [ "$FR_NEW" -gt 0 ] && [ "$AR_NEW" -gt 0 ] && [ "$JURIDICTION" -ge 1 ]; then
  echo "🎉 Migration FR/AR terminée avec succès ! ✅✅"
  exit 0
else
  echo "⚠️  Vérifiez les éléments marqués ❌ ci-dessus."
  exit 1
fi
