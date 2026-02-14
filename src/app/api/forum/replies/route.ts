import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const createReplySchema = z.object({
  content: z.string().min(5, 'Réponse trop courte').max(3000, 'Réponse trop longue'),
  threadId: z.string().min(1, 'Thread requis'),
});

function sanitizeContent(content: string): string {
  return content.replace(/<[^>]*>/g, '').trim();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const ban = await prisma.forumBan.findUnique({ where: { userId: user.id } });
    if (ban) {
      const isExpired = ban.expiresAt && ban.expiresAt < new Date();
      if (!isExpired) {
        return NextResponse.json(
          { error: 'Votre compte est banni du forum', reason: ban.reason },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = createReplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { content, threadId } = parsed.data;

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId, isDeleted: false },
    });
    if (!thread) {
      return NextResponse.json({ error: 'Discussion introuvable' }, { status: 404 });
    }
    if (thread.isLocked) {
      return NextResponse.json({ error: 'Cette discussion est verrouillée' }, { status: 403 });
    }

    const reply = await prisma.forumReply.create({
      data: {
        content: sanitizeContent(content),
        authorId: user.id,
        threadId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } },
      },
    });

    await prisma.forumThread.update({
      where: { id: threadId },
      data: {
        replyCount: { increment: 1 },
        lastReplyAt: new Date(),
      },
    });

    return NextResponse.json({
      ...reply,
      author: {
        ...reply.author,
        name: `${reply.author.firstName} ${reply.author.lastName}`.trim(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Forum POST reply error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
