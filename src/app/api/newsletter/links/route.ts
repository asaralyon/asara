export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

import { getJwtSecret } from '@/lib/jwt';

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    return user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

// GET - Récupérer les liens actifs (public)
export async function GET() {
  try {
    const links = await (prisma as any).newsletterLink.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error('NewsletterLinks GET error:', error);
    return NextResponse.json([]);
  }
}

// POST - Ajouter un lien (admin)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { title, url, source } = await request.json();
    
    if (!title || !url) {
      return NextResponse.json({ error: 'Titre et URL requis' }, { status: 400 });
    }

    const link = await (prisma as any).newsletterLink.create({
      data: { title, url, source: source || null }
    });

    return NextResponse.json(link);
  } catch (error: any) {
    console.error('NewsletterLinks POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Supprimer un lien (admin)
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await (prisma as any).newsletterLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('NewsletterLinks DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
