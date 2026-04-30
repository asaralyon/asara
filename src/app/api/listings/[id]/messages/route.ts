export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function getListingId(idOrSlug: string): Promise<string | null> {
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], isDeleted: false },
    select: { id: true, authorId: true },
  });
  return listing?.id || null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const listingId = await getListingId(params.id);
    if (!listingId) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

    const messages = await prisma.listingMessage.findMany({
      where: {
        listingId,
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    await prisma.listingMessage.updateMany({
      where: { listingId, receiverId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isDeleted: false },
    });
    if (!listing) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    if (listing.authorId === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous contacter vous-même' }, { status: 403 });
    }

    const { content } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

    const message = await prisma.listingMessage.create({
      data: {
        content: content.trim(),
        listingId: listing.id,
        senderId: user.id,
        receiverId: listing.authorId,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Notifier l'annonceur par email
    try {
      const annonceur = await prisma.user.findUnique({
        where: { id: listing.authorId },
        select: { email: true, firstName: true },
      });
      if (annonceur) {
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
          to: annonceur.email,
          subject: `💬 Nouveau message pour votre annonce "${listing.title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2D8C3C; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">ASARA</h1>
              </div>
              <div style="padding: 30px;">
                <h2>Bonjour ${annonceur.firstName},</h2>
                <p>Vous avez reçu un nouveau message concernant votre annonce :</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-weight: bold; margin: 0 0 10px;">${listing.title}</p>
                  <p style="margin: 0; color: #555;">${content.trim()}</p>
                </div>
                <p>De : ${user.name}</p>
                <a href="https://asara-lyon.fr/fr/mon-compte/annonces" 
                   style="background: #2D8C3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px;">
                  Voir mes messages →
                </a>
              </div>
            </div>
          `,
        });
      }
    } catch {}

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
