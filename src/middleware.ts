// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { getJwtSecret } from '@/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Routes publiques (accessibles sans connexion)
const publicPaths = [
  '', // Page d'accueil
  'connexion',
  'inscription',
  'adhesion',
  'mot-de-passe-oublie',
  'confirmation',
  'contact',
  'annuaire',
  'annuaire-associations',
  'evenements',
  'actualites',
  'mentions-legales',
  'politique-confidentialite',
  'newsletter',
  'cgu',
];

// Routes réservées aux utilisateurs connectés
const protectedPaths = [
  'mon-compte',
];

// Routes réservées aux admins
const adminPaths = ['admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ Exclure les routes API & statiques
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Appliquer l'internationalisation
  const intlResponse = intlMiddleware(request);
  const url = new URL(intlResponse.headers.get('x-middleware-rewrite') || request.url);
  const finalPathname = url.pathname;

  // 3️⃣ Extraire locale et chemin
  const localeMatch = finalPathname.match(/^\/([a-z]{2})\/(.*)/);
  const currentLocale = localeMatch?.[1] || defaultLocale;
  const pathWithoutLocale = localeMatch?.[2] || '';

  // 4️⃣ Vérifier le token
  const token = request.cookies.get('token')?.value;
  let user = null;

  if (token) {
    try {
      const secret = getJwtSecret();
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // 5️⃣ Vérifier le type de page
  const isPublicPath = publicPaths.some((p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/'));
  const isProtectedPath = protectedPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isAdminPath = adminPaths.some((p) => pathWithoutLocale.startsWith(p));

  // 6️⃣ Règles de redirection

  // Si NON connecté et tente d'accéder à une page protégée → /connexion
  if (!user && (isProtectedPath || isAdminPath)) {
    const loginUrl = new URL(`/${currentLocale}/connexion`, request.url);
    loginUrl.searchParams.set('returnTo', finalPathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si connecté et tente d'accéder à /connexion ou /inscription → /mon-compte
  if (user && (pathWithoutLocale === 'connexion' || pathWithoutLocale === 'inscription')) {
    return NextResponse.redirect(new URL(`/${currentLocale}/mon-compte`, request.url));
  }

  // Si connecté mais PAS admin et tente d'accéder à /admin → /
  if (user && isAdminPath && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // ✅ Sinon, laisser passer
  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|images|uploads|.*\\..*).*)*'],
};
