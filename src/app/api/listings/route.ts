export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(3000),
  price: z.number().min(0).optional().nullable(),
  isFree: z.boolean().default(false),
  category: z.enum(['EMPLOI','IMMOBILIER','SERVICES','VENTE','DONS','EVENEMENTS','COURS','AUTRES']),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  imageUrl1: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  imageUrl2: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  imageUrl3: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
});

function generateSlug(title: string): string {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60) + '-' + Date.now();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const myListings = searchParams.get('myListings');
    const where: any = myListings ? { isDeleted: false } : { status: 'ACTIVE', isDeleted: false };
    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({ listings, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.flatten());
      return NextResponse.json({ 
        error: 'Données invalides', 
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const activeCount = await prisma.listing.count({
      where: { authorId: user.id, status: { in: ['ACTIVE', 'PENDING'] }, isDeleted: false },
    });
    if (activeCount >= 3 && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Maximum 3 annonces actives autorisées' }, { status: 403 });
    }

    const listing = await prisma.listing.create({
      data: {
        ...parsed.data,
        authorId: user.id,
        slug: generateSlug(parsed.data.title),
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    try {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail({
        to: 'info@asara-lyon.fr',
        subject: `🏷️ Nouvelle annonce en attente — ${parsed.data.title}`,
        html: `<h2>Nouvelle annonce en attente</h2>
          <p><strong>Titre:</strong> ${parsed.data.title}</p>
          <p><strong>Catégorie:</strong> ${parsed.data.category}</p>
          <p><strong>Auteur:</strong> ${user.name}</p>
          <p><a href="https://asara-lyon.fr/fr/admin/annonces">Gérer les annonces →</a></p>`,
      });
    } catch {}

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}