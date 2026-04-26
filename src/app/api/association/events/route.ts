export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

import { getJwtSecret } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

async function verifyAssociation() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { associationProfile: true },
    });
    if (user?.role === 'ASSOCIATION' && user.associationProfile) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
}

// GET — récupérer les événements de l'association connectée
export async function GET() {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { associationId: user.associationProfile!.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST — créer un événement (status PENDING)
export async function POST(request: Request) {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      documentUrl,
      imageUrl1,
      imageUrl2,
      imageUrl3,
      eventDate,
      location,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type: type || 'GALLERY',
        documentUrl: documentUrl || null,
        imageUrl1: imageUrl1 || null,
        imageUrl2: imageUrl2 || null,
        imageUrl3: imageUrl3 || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        location: location || null,
        isPublished: false,
        status: 'PENDING',
        associationId: user.associationProfile!.id,
      },
    });

    // Notifier l'admin
    try {
      const adminUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr') + '/fr/admin/evenements-associations';
      await sendEmail({
        to: 'info@asara-lyon.fr',
        subject: `🗓️ Nouvel événement en attente — ${title}`,
        html: `
<!DOCTYPE html>
<html dir="ltr">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #0c2140 0%, #1a3a5c 100%); padding: 30px; text-align: center;">
      <img src="https://asara-lyon.fr/images/logo.png" alt="ASARA" width="120" style="margin-bottom: 12px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🗓️ Nouvel événement en attente</h1>
    </div>

    <div style="padding: 30px;">
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 16px;">
          ⏳ Action requise : Approuver ou refuser cet événement
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 140px;">Association</td>
          <td style="padding: 12px 0; font-weight: bold; color: #1f2937;">${user.associationProfile!.associationName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Titre</td>
          <td style="padding: 12px 0; font-weight: bold; color: #1f2937;">${title}</td>
        </tr>
        ${eventDate ? `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Date</td>
          <td style="padding: 12px 0; color: #1f2937;">${new Date(eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
        ` : ''}
        ${location ? `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Lieu</td>
          <td style="padding: 12px 0; color: #1f2937;">${location}</td>
        </tr>
        ` : ''}
        ${description ? `
        <tr>
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Description</td>
          <td style="padding: 12px 0; color: #1f2937;">${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</td>
        </tr>
        ` : ''}
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${adminUrl}" 
           style="display: inline-block; background: #0c2140; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          🗓️ Gérer les événements →
        </a>
      </div>
    </div>

    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">ASARA — Annuaire des Syriens de France</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error('Admin event email error (non-blocking):', emailError);
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE — supprimer un événement (seulement si PENDING ou REJECTED)
export async function DELETE(request: Request) {
  try {
    const user = await verifyAssociation();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { eventId } = await request.json();

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.associationId !== user.associationProfile!.id) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (event.status === 'APPROVED' && event.isPublished) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un événement publié' },
        { status: 403 }
      );
    }

    await prisma.event.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}