export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { associationId, isPublished } = await request.json();
    if (!associationId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    const association = await prisma.associationProfile.update({
      where: { id: associationId },
      data: { isPublished, publishedAt: isPublished ? new Date() : null },
    });
    return NextResponse.json({ success: true, association });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { associationId } = await request.json();
    if (!associationId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }
    await prisma.associationProfile.delete({ where: { id: associationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}