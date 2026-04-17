import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CheckCircle, Home, Mail } from 'lucide-react';

type Props = {
  params: { locale: string };
};

export default async function SuccessPage({ params }: Props) {
  const { locale } = params;
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="section bg-neutral-50 min-h-screen flex items-center">
        <div className="container-app">
          <div className="max-w-lg mx-auto text-center">
            <div className="card">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              
              <h1 className="text-2xl font-bold mb-4">
                {isRTL ? 'تم التسجيل بنجاح!' : 'Inscription réussie !'}
              </h1>
              
              <p className="text-neutral-600 mb-6">
                {isRTL 
                  ? 'شكراً لانضمامكم إلى أسارا. سنراجع طلبكم وسنتواصل معكم قريباً.'
                  : 'Merci de rejoindre ASARA. Nous allons examiner votre demande et vous contacter prochainement.'}
              </p>

              <div className="bg-primary-50 rounded-xl p-4 mb-6">
                <div className={`flex items-center justify-center gap-2 text-primary-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="w-5 h-5" />
                  <span>
                    {isRTL 
                      ? 'راجعوا بريدكم الإلكتروني للتأكيد'
                      : 'Vérifiez votre email pour la confirmation'}
                  </span>
                </div>
              </div>

              <Link
                href={`/${locale}`}
                className={`btn-primary inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Home className="w-4 h-4" />
                {isRTL ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
