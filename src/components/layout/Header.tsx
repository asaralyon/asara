'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Menu, X, User } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface UserData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'auth à chaque changement de route
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [pathname]); // Re-vérifier à chaque navigation

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('directory'), href: `/${locale}/annuaire` },
    { name: t('events'), href: `/${locale}/evenements` },
    { name: t('contact'), href: `/${locale}/contact` },
    { name: t('newsletter'), href: `/${locale}/newsletter` },
    { name: 'Forum', href: `/${locale}/forum` },
  ];

  const isRTL = locale === 'ar';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="ASARA"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold text-primary-600 hidden sm:inline">
              ASARA
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-neutral-600 hover:text-primary-500 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center gap-2">
                    {user.role === 'ADMIN' && (
                      <Link
                        href={`/${locale}/admin`}
                        className="text-sm text-neutral-600 hover:text-primary-500"
                      >
                        {t('admin')}
                      </Link>
                    )}
                    <Link
                      href={`/${locale}/mon-compte`}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user.firstName}</span>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/${locale}/connexion`}
                    className="hidden md:inline-flex btn-primary text-sm"
                  >
                    {t('login')}
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-neutral-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link
                      href={`/${locale}/admin`}
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-neutral-600 hover:bg-neutral-50 rounded-lg"
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <Link
                    href={`/${locale}/mon-compte`}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium"
                  >
                    {t('myAccount')}
                  </Link>
                </>
              ) : (
                <Link
                  href={`/${locale}/connexion`}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium"
                >
                  {t('login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
