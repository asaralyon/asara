export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

import { getJwtSecret } from '@/lib/jwt';

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    return user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

// GET — récupérer tous les événements PENDING des associations
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: {
        status: 'PENDING',
        associationId: { not: null },
      },
      include: {
        association: {
          select: {
            associationName: true,
            user: {
              select: {
                email: true,
                firstName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH — approuver ou rejeter un événement
export async function PATCH(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId, action } = await request.json();

    if (!eventId || !action) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        association: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (action === 'approve') {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          status: 'APPROVED',
          isPublished: true,
        },
      });

      // Email de confirmation à l'association
      if (event.association?.user?.email) {
        await sendEmail({
          to: event.association.user.email,
          subject: 'Votre événement a été approuvé - ASARA',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2D8C3C; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">ASARA</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Bonjour ${event.association.user.firstName},</h2>
                <p>Votre événement <strong>"${event.title}"</strong> a été approuvé et est maintenant visible sur le site.</p>
                <p>Merci pour votre contribution à la communauté ASARA !</p>
                <br>
                <p>Cordialement,</p>
                <p><strong>L'équipe ASARA</strong></p>
              </div>
            </div>
          `,
        });
      }

      return NextResponse.json({ success: true, action: 'approved' });
    }

    if (action === 'reject') {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          status: 'REJECTED',
          isPublished: false,
        },
      });

      // Email de refus à l'association
      if (event.association?.user?.email) {
        await sendEmail({
          to: event.association.user.email,
          subject: 'Votre événement n\'a pas été approuvé - ASARA',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #2D8C3C; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">ASARA</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Bonjour ${event.association.user.firstName},</h2>
                <p>Votre événement <strong>"${event.title}"</strong> n'a pas pu être approuvé pour le moment.</p>
                <p>N'hésitez pas à nous contacter pour plus d'informations.</p>
                <br>
                <p>Cordialement,</p>
                <p><strong>L'équipe ASARA</strong></p>
              </div>
            </div>
          `,
        });
      }

      return NextResponse.json({ success: true, action: 'rejected' });
    }

    return NextResponse.json({ error: 'Action non valide' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}