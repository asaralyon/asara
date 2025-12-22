import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Check, Briefcase, Users } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isRTL = params.locale === 'ar';
  return {
    title: isRTL ? 'العضوية' : 'Adhésion',
  };
}

export default async function AdhesionPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('membership');
  const isRTL = locale === 'ar';

  const plans = [
    {
      id: 'professional',
      icon: Briefcase,
      title: t('professional.title'),
      features: [
        t('professional.benefits.directory'),
        t('professional.benefits.profile'),
        t('professional.benefits.events'),
        t('professional.benefits.network'),
      ],
      href: `/${locale}/adhesion/professionnel`,
      primary: true,
    },
    {
      id: 'member',
      icon: Users,
      title: t('member.title'),
      features: [
        t('member.benefits.events'),
        t('member.benefits.community'),
        t('member.benefits.support'),
      ],
      href: `/${locale}/adhesion/membre`,
      primary: false,
    },
  ];

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container-app text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-4">
            {isRTL ? 'انضموا إلينا' : 'Rejoignez-nous'}
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {isRTL 
              ? 'اختاروا العضوية التي تناسبكم وانضموا إلى مجتمعنا'
              : 'Choisissez la formule qui vous convient et rejoignez notre communauté'}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`card border-2 ${
                  plan.primary 
                    ? 'border-primary-500 shadow-strong' 
                    : 'border-neutral-200'
                }`}
              >
                {plan.primary && (
                  <div className="bg-primary-500 text-white text-center py-1 text-sm font-medium -mx-6 -mt-6 mb-6 rounded-t-xl">
                    {isRTL ? 'الأكثر شعبية' : 'Le plus populaire'}
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.primary ? 'bg-primary-100' : 'bg-neutral-100'
                  }`}>
                    <plan.icon className={`w-8 h-8 ${
                      plan.primary ? 'text-primary-500' : 'text-neutral-500'
                    }`} />
                  </div>
                  <h2 className="text-xl font-bold">{plan.title}</h2>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.primary
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {isRTL ? 'اختيار' : 'Choisir'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
