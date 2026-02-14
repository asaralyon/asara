import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const banSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(5, 'Raison trop courte').max(500),
  isPermanent: z.boolean().default(false),
  durationDays: z.number().min(1).max(365).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const bans = await prisma.forumBan.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        bannedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { bannedAt: 'desc' },
    });

    const bansWithNames = bans.map((b) => ({
      ...b,
      user: { ...b.user, name: `${b.user.firstName} ${b.user.lastName}`.trim() },
      bannedBy: { ...b.bannedBy, name: `${b.bannedBy.firstName} ${b.bannedBy.lastName}`.trim() },
    }));

    return NextResponse.json(bansWithNames);
  } catch (error) {
    console.error('Forum GET bans error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAuthUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = banSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, reason, isPermanent, durationDays } = parsed.data;

    const existingBan = await prisma.forumBan.findUnique({ where: { userId } });
    if (existingBan) {
      const updated = await prisma.forumBan.update({
        where: { userId },
        data: {
          reason,
          isPermanent,
          bannedById: admin.id,
          bannedAt: new Date(),
          expiresAt: isPermanent
            ? null
            : durationDays
              ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
              : null,
        },
      });
      return NextResponse.json(updated);
    }

    const ban = await prisma.forumBan.create({
      data: {
        userId,
        reason,
        isPermanent,
        bannedById: admin.id,
        expiresAt: isPermanent
          ? null
          : durationDays
            ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    return NextResponse.json(ban, { status: 201 });
  } catch (error) {
    console.error('Forum POST ban error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAuthUser(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    await prisma.forumBan.delete({ where: { userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum DELETE ban error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
