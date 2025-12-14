import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const referer = request.headers.get('referer') || '';
  const localeMatch = referer.match(/\/(fr|ar)\//);
  const locale = localeMatch?.[1] || 'fr';
  
  const response = NextResponse.redirect(new URL(`/${locale}`, request.url));
  
  // Supprimer le cookie de TOUTES les façons possibles
  // Car il peut avoir été créé avec différentes configurations
  
  const deleteOptions = [
    // Avec domain .asara-lyon.fr
    { domain: '.asara-lyon.fr', path: '/' },
    // Sans domain (pour cookies créés sans domain)
    { path: '/' },
    // Avec domain www.asara-lyon.fr
    { domain: 'www.asara-lyon.fr', path: '/' },
    // Avec domain asara-lyon.fr (sans point)
    { domain: 'asara-lyon.fr', path: '/' },
  ];
  
  for (const opts of deleteOptions) {
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      ...opts,
    });
  }
  
  return response;
}
