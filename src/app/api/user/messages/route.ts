export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Récupérer toutes les annonces où l'utilisateur a des messages
    const messages = await prisma.listingMessage.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        listing: {
          select: { id: true, title: true, slug: true, status: true, imageUrl1: true },
        },
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Grouper par annonce
    const conversations = new Map<string, any>();
    for (const msg of messages) {
      const listingId = msg.listingId;
      if (!conversations.has(listingId)) {
        const otherPerson = msg.senderId === user.id ? msg.receiver : msg.sender;
        conversations.set(listingId, {
          listingId,
          listing: msg.listing,
          otherPerson,
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        });
      }
      const conv = conversations.get(listingId);
      conv.messages.push(msg);
      if (!msg.isRead && msg.receiverId === user.id) {
        conv.unreadCount++;
      }
    }

    return NextResponse.json(Array.from(conversations.values()));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
