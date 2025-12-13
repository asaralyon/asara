import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    console.log('Auth/me - All cookies:', cookieStore.getAll().map(c => c.name));
    console.log('Auth/me - Token exists:', !!token);

    if (!token) {
      return NextResponse.json(
        { error: 'Non connecte' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    console.log('Auth/me - Token valid, userId:', payload.userId);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { currentPeriodEnd: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouve' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      role: user.role,
      status: user.status,
      profile: user.profile,
      subscription: user.subscriptions[0] || null,
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    return NextResponse.json(
      { error: 'Session invalide' },
      { status: 401 }
    );
  }
}
