import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const createThreadSchema = z.object({
  title: z.string().min(5, 'Titre trop court').max(150, 'Titre trop long'),
  content: z.string().min(20, 'Contenu trop court').max(5000, 'Contenu trop long'),
  categoryId: z.string().min(1, 'Catégorie requise'),
});

function sanitizeContent(content: string): string {
  return content.replace(/<[^>]*>/g, '').trim();
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base}-${Date.now()}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = {
      isDeleted: false,
      ...(categoryId ? { categoryId } : {}),
    };

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          category: { select: { id: true, name: true, color: true, slug: true } },
          _count: { select: { replies: { where: { isDeleted: false } } } },
        },
        orderBy: [{ isPinned: 'desc' }, { lastReplyAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    const threadsWithName = threads.map((t) => ({
      ...t,
      author: {
        ...t.author,
        name: `${t.author.firstName} ${t.author.lastName}`.trim(),
      },
    }));

    return NextResponse.json({
      threads: threadsWithName,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Forum GET threads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
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
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, content, categoryId } = parsed.data;

    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId, isActive: true },
    });
    if (!category) {
      return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
    }

    const thread = await prisma.forumThread.create({
      data: {
        title: sanitizeContent(title),
        content: sanitizeContent(content),
        slug: generateSlug(title),
        authorId: user.id,
        categoryId,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        category: { select: { id: true, name: true, color: true, slug: true } },
      },
    });

    return NextResponse.json({
      ...thread,
      author: {
        ...thread.author,
        name: `${thread.author.firstName} ${thread.author.lastName}`.trim(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Forum POST thread error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
