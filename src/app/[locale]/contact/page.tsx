import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'contact' });
  return {
    title: t('title'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('contact');
  const isRTL = locale === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12">
        <div className="container-app text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-600 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-neutral-600">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-app">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <div className="card">
              <ContactForm locale={locale} />
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              {/* Adresse */}
              <div className="card">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('info.address')}</h3>
                    <p className="text-neutral-600">
                      123 Rue de la République<br />
                      69100 Villeurbanne<br />
                      France
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="card">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('info.email')}</h3>
                    <a
                      href="mailto:info@asara-lyon.fr"
                      className="text-primary-500 hover:text-primary-600"
                    >
                      info@asara-lyon.fr
                    </a>
                  </div>
                </div>
              </div>

              {/* Téléphone */}
              <div className="card">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('info.phone')}</h3>
                    <a
                      href="tel:+33400000000"
                      className="text-primary-500 hover:text-primary-600"
                    >
                      +33 4 00 00 00 00
                    </a>
                  </div>
                </div>
              </div>

              {/* Horaires */}
              <div className="card">
                <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t('info.hours')}</h3>
                    <p className="text-neutral-600">{t('info.hoursValue')}</p>
                  </div>
                </div>
              </div>

              {/* Carte Google Maps */}
              <div className="card p-0 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2783.2!2d4.9!3d45.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDXCsDQ2JzE0LjQiTiA0wrA1NCcwMC4wIkU!5e0!3m2!1sfr!2sfr!4v1234567890"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
