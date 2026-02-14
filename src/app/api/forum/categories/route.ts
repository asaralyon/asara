import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  nameAr: z.string().optional(),
  slug: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#16a34a'),
  order: z.number().default(0),
});

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { threads: { where: { isDeleted: false } } },
        },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Forum GET categories error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const category = await prisma.forumCategory.create({ data: parsed.data });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Forum POST category error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
