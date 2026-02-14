import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const thread = await prisma.forumThread.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isDeleted: false },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } },
        category: { select: { id: true, name: true, color: true, slug: true } },
        replies: {
          where: { isDeleted: false },
          include: {
            author: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Discussion introuvable' }, { status: 404 });
    }

    await prisma.forumThread.update({
      where: { id: thread.id },
      data: { viewCount: { increment: 1 } },
    });

    const threadWithNames = {
      ...thread,
      author: {
        ...thread.author,
        name: `${thread.author.firstName} ${thread.author.lastName}`.trim(),
      },
      replies: thread.replies.map((r) => ({
        ...r,
        author: {
          ...r.author,
          name: `${r.author.firstName} ${r.author.lastName}`.trim(),
        },
      })),
    };

    return NextResponse.json(threadWithNames);
  } catch (error) {
    console.error('Forum GET thread error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } });
    if (!thread) {
      return NextResponse.json({ error: 'Discussion introuvable' }, { status: 404 });
    }

    let updatedThread;
    switch (action) {
      case 'delete':
        updatedThread = await prisma.forumThread.update({
          where: { id: params.id },
          data: { isDeleted: true, deletedAt: new Date(), deletedById: user.id },
        });
        break;
      case 'pin':
        updatedThread = await prisma.forumThread.update({
          where: { id: params.id },
          data: { isPinned: !thread.isPinned },
        });
        break;
      case 'lock':
        updatedThread = await prisma.forumThread.update({
          where: { id: params.id },
          data: { isLocked: !thread.isLocked },
        });
        break;
      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
    }

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Forum PATCH thread error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
