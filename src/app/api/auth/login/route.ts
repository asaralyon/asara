import { NextResponse } from 'next/server';
import { getJwtSecret } from '@/lib/jwt';
import crypto from 'crypto';
import { rateLimitAuth } from '@/lib/rate-limit';
import { compare } from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, remaining } = await rateLimitAuth.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );
  }

  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Votre compte est suspendu' },
        { status: 403 }
      );
    }

    const secret = getJwtSecret();
    
    // Access token 15 minutes
    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(secret);

    // Refresh token 7 jours
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Construction de la réponse
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

    // Cookie access token (15 min)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    // Cookie refresh token (7 jours)
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}