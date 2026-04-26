export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const messages = await prisma.listingMessage.findMany({
      where: {
        listingId: params.id,
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Marquer comme lus
    await prisma.listingMessage.updateMany({
      where: { listingId: params.id, receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    if (listing.authorId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous contacter vous-même' }, { status: 403 });
    }

    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

    const message = await prisma.listingMessage.create({
      data: {
        content: content.trim(),
        listingId: params.id,
        senderId: user.id,
        receiverId: listing.authorId,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
