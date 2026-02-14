import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const reply = await prisma.forumReply.findUnique({
      where: { id: params.id },
    });
    if (!reply) {
      return NextResponse.json({ error: 'Réponse introuvable' }, { status: 404 });
    }

    if (reply.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await prisma.forumReply.update({
      where: { id: params.id },
      data: { isDeleted: true, deletedAt: new Date(), deletedById: user.id },
    });

    await prisma.forumThread.update({
      where: { id: reply.threadId },
      data: { replyCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum DELETE reply error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
