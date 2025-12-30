'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="ASARA"
                width={50}
                height={50}
                className="w-12 h-12"
              />
              <span className="text-xl font-bold">ASARA</span>
            </Link>
            <p className="text-neutral-400 mb-4">
              {t('description')}
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com/asaralyon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/asaralyon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('quickLinks')}</h3>
            <nav className="space-y-2">
              <Link
                href={`/${locale}`}
                className="block text-neutral-400 hover:text-white transition-colors"
              >
                {tNav('home')}
              </Link>
              <Link
                href={`/${locale}/annuaire`}
                className="block text-neutral-400 hover:text-white transition-colors"
              >
                {tNav('directory')}
              </Link>
              <Link
                href={`/${locale}/evenements`}
                className="block text-neutral-400 hover:text-white transition-colors"
              >
                {tNav('events')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="block text-neutral-400 hover:text-white transition-colors"
              >
                {tNav('contact')}
              </Link>
              <Link
                href={`/${locale}/cgu`}
                className="block text-neutral-400 hover:text-white transition-colors"
              >
                {isRTL ? 'الشروط والأحكام' : 'CGU'}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t('contact')}</h3>
            <div className="space-y-3 text-neutral-400">
              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                  123 Rue de la République<br />
                  69100 Villeurbanne
                </span>
              </div>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@asara-lyon.fr" className="hover:text-white transition-colors">
                  info@asara-lyon.fr
                </a>
              </div>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+33400000000" className="hover:text-white transition-colors">
                  +33 4 00 00 00 00
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-700">
        <div className="container-app py-6">
          <p className="text-center text-neutral-500 text-sm">
            © {currentYear} ASARA. {t('rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
