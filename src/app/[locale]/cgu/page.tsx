export const dynamic = "force-dynamic";

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isRTL = params.locale === 'ar';
  return {
    title: isRTL ? 'الشروط والأحكام - ASARA Lyon' : 'CGU - ASARA Lyon',
    description: isRTL 
      ? 'الشروط والأحكام العامة للاستخدام'
      : 'Conditions Générales d\'Utilisation',
  };
}

export default function CGUPage({ params }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-12">
        <div className="container-app">
          <Link
            href={'/' + locale}
            className={'inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 ' + (isRTL ? 'flex-row-reverse' : '')}
          >
            <ArrowLeft className={'w-4 h-4 ' + (isRTL ? 'rotate-180' : '')} />
            {isRTL ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil'}
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold">
            {isRTL ? 'الشروط والأحكام العامة للاستخدام' : 'Conditions Générales d\'Utilisation'}
          </h1>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card prose prose-neutral max-w-none">
            {isRTL ? (
              <div className="space-y-8 text-right">
                <p className="text-neutral-600">آخر تحديث: ديسمبر 2025</p>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">1. المعلومات القانونية</h2>
                  <p>موقع www.asara-lyon.fr تديره جمعية السوريين في أوفيرن رون ألب (ASARA Lyon)، وهي جمعية خاضعة لقانون 1901.</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>الاسم: ASARA Lyon - جمعية السوريين في أوفيرن رون ألب</li>
                    <li>العنوان: ليون، فرنسا</li>
                    <li>البريد الإلكتروني: info@asara-lyon.fr</li>
                    <li>الموقع: www.asara-lyon.fr</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">2. الغرض من الموقع</h2>
                  <p>يهدف هذا الموقع إلى:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>تقديم الجمعية وأنشطتها</li>
                    <li>توفير دليل للمهنيين السوريين في المنطقة</li>
                    <li>إعلام الأعضاء بالفعاليات والأخبار</li>
                    <li>تسهيل الانضمام إلى الجمعية</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">3. حماية البيانات الشخصية (RGPD)</h2>
                  
                  <h3 className="text-lg font-semibold mt-6 mb-3">3.1 مسؤول معالجة البيانات</h3>
                  <p>جمعية ASARA Lyon هي المسؤولة عن معالجة البيانات الشخصية المجمعة على هذا الموقع.</p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.2 البيانات المجمعة</h3>
                  <p>نجمع البيانات التالية:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>بيانات التعريف: الاسم، اللقب، البريد الإلكتروني</li>
                    <li>البيانات المهنية (للمهنيين): المهنة، الشركة، رقم الهاتف، العنوان، الموقع الإلكتروني</li>
                    <li>بيانات الاتصال: الرسائل المرسلة عبر نموذج الاتصال</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.3 الغرض من المعالجة</h3>
                  <p>تُستخدم بياناتك من أجل:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>إدارة عضويتك في الجمعية</li>
                    <li>نشر ملفك في الدليل المهني (إذا كنت مهنياً)</li>
                    <li>إرسال النشرة الإخبارية (بموافقتك)</li>
                    <li>الرد على طلباتك</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.4 الأساس القانوني</h3>
                  <p>تعتمد معالجة بياناتك على:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>موافقتك (للنشرة الإخبارية)</li>
                    <li>تنفيذ العقد (للعضوية)</li>
                    <li>المصلحة المشروعة (للدليل المهني)</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.5 مدة الاحتفاظ</h3>
                  <p>يتم الاحتفاظ ببياناتك طوال مدة عضويتك، ثم لمدة 3 سنوات بعد آخر اتصال.</p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.6 حقوقك</h3>
                  <p>وفقاً للائحة العامة لحماية البيانات (RGPD)، لديك الحقوق التالية:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li><strong>حق الوصول:</strong> الحصول على نسخة من بياناتك</li>
                    <li><strong>حق التصحيح:</strong> تصحيح البيانات غير الدقيقة</li>
                    <li><strong>حق الحذف:</strong> طلب حذف بياناتك</li>
                    <li><strong>حق التقييد:</strong> تقييد معالجة بياناتك</li>
                    <li><strong>حق النقل:</strong> استلام بياناتك بصيغة قابلة للقراءة</li>
                    <li><strong>حق الاعتراض:</strong> الاعتراض على معالجة بياناتك</li>
                  </ul>
                  <p className="mt-4">لممارسة حقوقك، اتصل بنا على: info@asara-lyon.fr</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">4. ملفات تعريف الارتباط (Cookies)</h2>
                  <p>يستخدم هذا الموقع ملفات تعريف الارتباط الضرورية فقط لتشغيله:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>ملفات تعريف الارتباط للمصادقة (الاتصال بحسابك)</li>
                    <li>ملفات تعريف الارتباط لتفضيلات اللغة</li>
                  </ul>
                  <p className="mt-4">لا نستخدم ملفات تعريف الارتباط الإعلانية أو التتبعية.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">5. الملكية الفكرية</h2>
                  <p>جميع محتويات هذا الموقع (نصوص، صور، شعارات) محمية بحقوق الملكية الفكرية. يُحظر أي نسخ دون إذن مسبق.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">6. المسؤولية</h2>
                  <p>تسعى ASARA Lyon لضمان دقة المعلومات المنشورة، لكنها لا تتحمل المسؤولية عن أي أخطاء أو سهو. المعلومات المقدمة في الدليل المهني هي مسؤولية المهنيين المعنيين.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">7. الروابط الخارجية</h2>
                  <p>قد يحتوي الموقع على روابط لمواقع خارجية. ASARA Lyon ليست مسؤولة عن محتوى هذه المواقع.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">8. تعديل الشروط</h2>
                  <p>تحتفظ ASARA Lyon بالحق في تعديل هذه الشروط في أي وقت. ستُنشر التعديلات على هذه الصفحة.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">9. القانون المعمول به</h2>
                  <p>تخضع هذه الشروط للقانون الفرنسي. في حالة النزاع، تكون محاكم ليون مختصة.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">10. الاتصال</h2>
                  <p>لأي سؤال حول هذه الشروط أو بياناتك الشخصية:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>البريد الإلكتروني: info@asara-lyon.fr</li>
                    <li>الموقع: www.asara-lyon.fr/ar/contact</li>
                  </ul>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-neutral-600">Dernière mise à jour : Décembre 2025</p>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">1. Mentions légales</h2>
                  <p>Le site www.asara-lyon.fr est édité par l Association des Syriens d Auvergne Rhône-Alpes (ASARA Lyon), association loi 1901.</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Nom : ASARA Lyon - Association des Syriens d Auvergne Rhône-Alpes</li>
                    <li>Adresse : Lyon, France</li>
                    <li>Email : info@asara-lyon.fr</li>
                    <li>Site : www.asara-lyon.fr</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">2. Objet du site</h2>
                  <p>Ce site a pour objet de :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Présenter l association et ses activités</li>
                    <li>Proposer un annuaire des professionnels syriens de la région</li>
                    <li>Informer les membres des événements et actualités</li>
                    <li>Permettre l adhésion à l association</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">3. Protection des données personnelles (RGPD)</h2>
                  
                  <h3 className="text-lg font-semibold mt-6 mb-3">3.1 Responsable du traitement</h3>
                  <p>L association ASARA Lyon est responsable du traitement des données personnelles collectées sur ce site.</p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.2 Données collectées</h3>
                  <p>Nous collectons les données suivantes :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Données d identification : nom, prénom, email</li>
                    <li>Données professionnelles (pour les professionnels) : profession, entreprise, téléphone, adresse, site web</li>
                    <li>Données de contact : messages envoyés via le formulaire de contact</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.3 Finalités du traitement</h3>
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Gérer votre adhésion à l association</li>
                    <li>Publier votre profil dans l annuaire professionnel (si vous êtes professionnel)</li>
                    <li>Envoyer la newsletter (avec votre consentement)</li>
                    <li>Répondre à vos demandes</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.4 Base légale</h3>
                  <p>Le traitement de vos données repose sur :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Votre consentement (newsletter)</li>
                    <li>L exécution d un contrat (adhésion)</li>
                    <li>L intérêt légitime (annuaire professionnel)</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.5 Durée de conservation</h3>
                  <p>Vos données sont conservées pendant la durée de votre adhésion, puis 3 ans après le dernier contact.</p>

                  <h3 className="text-lg font-semibold mt-6 mb-3">3.6 Vos droits</h3>
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li><strong>Droit d accès :</strong> obtenir une copie de vos données</li>
                    <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                    <li><strong>Droit à l effacement :</strong> demander la suppression de vos données</li>
                    <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                    <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format lisible</li>
                    <li><strong>Droit d opposition :</strong> vous opposer au traitement de vos données</li>
                  </ul>
                  <p className="mt-4">Pour exercer vos droits, contactez-nous à : info@asara-lyon.fr</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">4. Cookies</h2>
                  <p>Ce site utilise uniquement des cookies nécessaires à son fonctionnement :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Cookies d authentification (connexion à votre compte)</li>
                    <li>Cookies de préférence de langue</li>
                  </ul>
                  <p className="mt-4">Nous n utilisons pas de cookies publicitaires ou de suivi.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">5. Propriété intellectuelle</h2>
                  <p>L ensemble du contenu de ce site (textes, images, logos) est protégé par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">6. Responsabilité</h2>
                  <p>ASARA Lyon s efforce d assurer l exactitude des informations publiées mais ne saurait être tenue responsable des erreurs ou omissions. Les informations fournies dans l annuaire professionnel sont sous la responsabilité des professionnels concernés.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">7. Liens externes</h2>
                  <p>Le site peut contenir des liens vers des sites externes. ASARA Lyon n est pas responsable du contenu de ces sites.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">8. Modification des CGU</h2>
                  <p>ASARA Lyon se réserve le droit de modifier ces CGU à tout moment. Les modifications seront publiées sur cette page.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">9. Droit applicable</h2>
                  <p>Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux de Lyon seront compétents.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-primary-700 mb-4">10. Contact</h2>
                  <p>Pour toute question concernant ces CGU ou vos données personnelles :</p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Email : info@asara-lyon.fr</li>
                    <li>Site : www.asara-lyon.fr/fr/contact</li>
                  </ul>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
