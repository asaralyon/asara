import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key');
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { associationProfile: true },
    });

    if (!user || user.role !== 'ASSOCIATION') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const {
      associationName,
      registrationNumber,
      activities,
      description,
      address,
      city,
      postalCode,
      phone,
      email,
      website,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      whatsappUrl,
    } = body;

    const updatedProfile = await prisma.associationProfile.update({
      where: { userId: payload.userId as string },
      data: {
        associationName,
        registrationNumber: registrationNumber || null,
        activities: activities || null,
        description: description || null,
        address: address || null,
        city,
        postalCode: postalCode || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        whatsappUrl: whatsappUrl || null,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating association profile:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}