export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { getJwtSecret } from '@/lib/jwt';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
    }

    // Vérifier le refresh token en BDD
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    if (tokenRecord.expiresAt < new Date()) {
      // Supprimer le token expiré
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return NextResponse.json({ error: 'Token expiré' }, { status: 401 });
    }

    const user = tokenRecord.user;

    // Rotation : supprimer l'ancien refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    // Créer nouveau access token (15 minutes)
    const accessToken = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(getJwtSecret());

    // Créer nouveau refresh token (7 jours) - rotation
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Nouveau access token (15 min)
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // Nouveau refresh token (7 jours)
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
