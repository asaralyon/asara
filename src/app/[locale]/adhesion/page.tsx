import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Check, Briefcase, Users, Building } from 'lucide-react';

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isRTL = params.locale === 'ar';
  return {
    title: isRTL ? 'الانضمام | ASARA Lyon' : 'Adhésion | ASARA Lyon',
  };
}

export default async function AdhesionPage({ params }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';

  const plans = [
    {
      id: 'professional',
      icon: Briefcase,
      badge: isRTL ? 'الأكثر شعبية' : 'Le plus populaire',
      badgeColor: 'bg-primary-500',
      title: isRTL ? 'عضوية مهني' : 'Adhésion Professionnel',
      price: '100 €',
      priceLabel: isRTL ? '/ سنة' : '/ an',
      description: isRTL
        ? 'للمهنيين السوريين الراغبين في الظهور في الدليل'
        : "Pour les professionnels syriens souhaitant être visibles dans l'annuaire",
      features: isRTL
        ? ['ظهور في الدليل المهني', 'صفحة ملف شخصي مخصصة', 'حضور الفعاليات', 'شبكة مهنية']
        : ["Visibilité dans l'annuaire", 'Page profil dédiée', 'Accès aux événements', 'Réseau professionnel'],
      href: `/${locale}/adhesion/professionnel`,
      primary: true,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      ctaColor: 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg',
    },
    {
      id: 'member',
      icon: Users,
      badge: null,
      badgeColor: '',
      title: isRTL ? 'عضوية عادية' : 'Adhésion Membre',
      price: '15 €',
      priceLabel: isRTL ? '/ سنة' : '/ an',
      description: isRTL
        ? 'لكل من يريد الانتساب إلى جمعية ASARA ودعمها'
        : "Pour soutenir l'association et faire partie de la communauté",
      features: isRTL
        ? ['حضور الفعاليات', 'الانتماء للمجتمع', 'دعم الجمعية', 'النشرة الإخبارية']
        : ["Accès aux événements", "Appartenir à la communauté", "Soutenir l'association", 'Newsletter'],
      href: `/${locale}/adhesion/membre`,
      primary: false,
      iconBg: 'bg-neutral-100',
      iconColor: 'text-neutral-600',
      ctaColor: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    },
    {
      id: 'association',
      icon: Building,
      badge: isRTL ? 'مجاني' : 'Gratuit',
      badgeColor: 'bg-green-500',
      title: isRTL ? 'تسجيل جمعية' : 'Référencer une Association',
      price: isRTL ? 'مجاناً' : 'Gratuit',
      priceLabel: '',
      description: isRTL
        ? 'للجمعيات السورية العاملة في فرنسا الراغبة في الظهور في الدليل'
        : 'Pour les associations syriennes en France souhaitant être référencées',
      features: isRTL
        ? [
            'ظهور في دليل الجمعيات',
            'عرض الأنشطة والمعلومات',
            'روابط Facebook / Instagram / TikTok',
            'إدارة ملف الجمعية',
          ]
        : [
            "Visibilité dans l'annuaire des associations",
            'Présentation des activités',
            'Liens Facebook / Instagram / TikTok',
            'Gestion de votre fiche',
          ],
      href: `/${locale}/adhesion/association`,
      primary: false,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      ctaColor: 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg',
    },
  ];

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="container-app text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-4">
            {isRTL ? 'انضموا إلى مجتمعنا' : 'Rejoignez notre communauté'}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {isRTL
              ? 'اختاروا الخيار المناسب لكم وكونوا جزءاً من مجتمع ASARA'
              : 'Choisissez la formule qui vous convient et rejoignez la communauté ASARA'}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`card border-2 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                  plan.primary
                    ? 'border-primary-500 shadow-strong'
                    : plan.id === 'association'
                    ? 'border-green-300'
                    : 'border-neutral-200'
                }`}
              >
                {/* Badge */}
                {plan.badge ? (
                  <div className={`${plan.badgeColor} text-white text-center py-1.5 text-xs font-semibold -mx-6 -mt-6 mb-6 rounded-t-xl`}>
                    {plan.badge}
                  </div>
                ) : (
                  <div className="pt-2" />
                )}

                {/* Icon + Title */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${plan.iconBg}`}>
                    <plan.icon className={`w-8 h-8 ${plan.iconColor}`} />
                  </div>
                  <h2 className="text-xl font-bold mb-2">{plan.title}</h2>
                  <p className="text-neutral-500 text-sm px-2">{plan.description}</p>
                </div>

                {/* Prix */}
                <div className="text-center mb-6">
                  <span className={`text-3xl font-bold ${
                    plan.id === 'association' ? 'text-green-600' : 'text-primary-600'
                  }`}>
                    {plan.price}
                  </span>
                  {plan.priceLabel && (
                    <span className="text-neutral-500 text-sm ml-1">{plan.priceLabel}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] ${plan.ctaColor}`}
                >
                  {isRTL ? 'اختيار' : 'Choisir'}
                </Link>
              </div>
            ))}
          </div>

          {/* Note bas de page */}
          <p className="text-center text-sm text-neutral-500 mt-10">
            {isRTL
              ? '🔒 جميع بياناتكم محمية وفق سياسة RGPD'
              : '🔒 Toutes vos données sont protégées conformément au RGPD'}
          </p>
        </div>
      </section>
    </main>
  );
}