export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isDeleted: false },
      include: { author: { select: { id: true, firstName: true, lastName: true, createdAt: true } } },
    });
    if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    // Incrémenter vues
    await prisma.listing.update({ where: { id: listing.id }, data: { views: { increment: 1 } } });
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const body = await request.json();
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    if (listing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    const updated = await prisma.listing.update({ where: { id: params.id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    if (listing.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    await prisma.listing.update({ where: { id: params.id }, data: { isDeleted: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
