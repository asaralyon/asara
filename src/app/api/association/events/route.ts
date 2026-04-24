export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

import { getJwtSecret } from '@/lib/jwt';

async function verifyAssociation() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { associationProfile: true },
    });
    if (user?.role === 'ASSOCIATION' && user.associationProfile) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

// GET — récupérer les événements de l'association connectée
export async function GET() {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { associationId: user.associationProfile!.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST — créer un événement (status PENDING)
export async function POST(request: Request) {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      documentUrl,
      imageUrl1,
      imageUrl2,
      imageUrl3,
      eventDate,
      location,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type: type || 'GALLERY',
        documentUrl: documentUrl || null,
        imageUrl1: imageUrl1 || null,
        imageUrl2: imageUrl2 || null,
        imageUrl3: imageUrl3 || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        location: location || null,
        isPublished: false,
        status: 'PENDING',
        associationId: user.associationProfile!.id,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE — supprimer un événement (seulement si PENDING ou REJECTED)
export async function DELETE(request: Request) {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await request.json();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.associationId !== user.associationProfile!.id) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (event.status === 'APPROVED' && event.isPublished) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un événement publié' },
        { status: 403 }
      );
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}