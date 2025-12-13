export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
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

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type: type || 'GALLERY',
        documentUrl,
        imageUrl1,
        imageUrl2,
        imageUrl3,
        eventDate: eventDate ? new Date(eventDate) : null,
        location,
        isPublished: false,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { eventId, isPublished } = await request.json();

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isPublished },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Event update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { eventId } = await request.json();

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}