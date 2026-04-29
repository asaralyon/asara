import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ClientSessionProvider } from '@/components/auth/ClientSessionProvider';
import '../globals.css';
import { Analytics } from '@vercel/analytics/next';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  const title = t('title');
  const description = t('description');
  const baseUrl = 'https://asara-lyon.fr';

  return {
    title: {
      default: title,
      template: '%s | ASARA',
    },
    description,
    keywords: [
      'ASARA', 'Annuaire Syriens France', 'professionnels syriens',
      'communauté syrienne France', 'annuaire syrien', 'associations syriennes',
      'Syrian community France', 'المجتمع السوري في فرنسا', 'دليل السوريين'
    ],
    authors: [{ name: 'ASARA' }],
    creator: 'ASARA',
    publisher: 'ASARA',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl + '/' + locale,
      languages: {
        'fr': baseUrl + '/fr',
        'ar': baseUrl + '/ar',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_SA' : 'fr_FR',
      url: baseUrl + '/' + locale,
      siteName: 'ASARA',
      title,
      description,
      images: [
        {
          url: baseUrl + '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'ASARA - Association des Syriens d\'France',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [baseUrl + '/images/og-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Ajoute tes codes de vérification ici si tu en as
      // google: 'ton-code-google',
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo-lg.png" />
        <meta name="theme-color" content="#2D8C3C" />
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <ClientSessionProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </ClientSessionProvider>
        </NextIntlClientProvider>
        <Analytics />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('SW registered'); })
                .catch(function(err) { console.log('SW error:', err); });
            });
          }
        `}} />
      </body>
    </html>
  );
}
