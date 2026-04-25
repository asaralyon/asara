import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const referer = request.headers.get('referer') || '';
  const localeMatch = referer.match(/\/(fr|ar)\//);
  const locale = localeMatch?.[1] || 'fr';
  
  const redirectUrl = new URL('/' + locale + '/connexion', request.url);
  const response = NextResponse.redirect(redirectUrl);
  
  // Supprimer le cookie de TOUTES les façons possibles
  // Car il peut avoir été créé avec différentes configurations de domaine
  
  // 1. Sans domaine (cookies créés récemment)
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  
  // 2. Avec .asara-lyon.fr (anciens cookies)
  response.headers.append(
    'Set-Cookie',
    'token=; Path=/; Domain=.asara-lyon.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
  );
  
  // 3. Avec www.asara-lyon.fr
  response.headers.append(
    'Set-Cookie', 
    'token=; Path=/; Domain=www.asara-lyon.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
  );
  
  // 4. Avec asara-lyon.fr (sans point)
  response.headers.append(
    'Set-Cookie',
    'token=; Path=/; Domain=asara-lyon.fr; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
  );

  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
