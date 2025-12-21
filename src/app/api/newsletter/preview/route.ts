export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    return user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Recuperer les evenements a venir
    const today = new Date();
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        eventDate: { gte: today }
      },
      orderBy: { eventDate: 'asc' },
      take: 5
    });

    // Recuperer les articles publies
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Compter les membres
    const memberCount = await prisma.user.count({
      where: {
        OR: [
          { role: 'MEMBER' },
          { role: 'PROFESSIONAL' },
          { role: 'ADMIN' }
        ]
      }
    });

    // Historique des newsletters
    const lastNewsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      news: [],
      events,
      articles,
      memberCount,
      lastNewsletters
    });

  } catch (error) {
    console.error('Newsletter preview error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
