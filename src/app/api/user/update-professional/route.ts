import { NextRequest, NextResponse } from 'next/server';
import { getJwtSecret } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Non connecté' },
        { status: 401 }
      );
    }

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    const body = await request.json();
    const {
      companyName,
      profession,
      category,
      specialty,
      description,
      address,
      city,
      postalCode,
      professionalPhone,
      professionalEmail,
      website,
      linkedinUrl,
      facebookUrl,
      instagramUrl,
    } = body;

    // Vérifier que l'utilisateur est un professionnel
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { profile: true },
    });

    if (!user || user.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Mise à jour ou création du profil professionnel
    let updatedProfile;
    if (user.profile) {
      updatedProfile = await prisma.professionalProfile.update({
        where: { userId: payload.userId as string },
        data: {
          companyName,
          profession,
          category,
          specialty,
          description,
          address,
          city,
          postalCode,
          professionalPhone,
          professionalEmail,
          website,
          linkedinUrl,
          facebookUrl,
          instagramUrl,
        },
      });
    } else {
      // Créer le profil s'il n'existe pas
      updatedProfile = await prisma.professionalProfile.create({
        data: {
          userId: payload.userId as string,
          profession,
          category,
          companyName,
          specialty,
          description,
          address,
          city,
          postalCode,
          professionalPhone,
          professionalEmail,
          website,
          linkedinUrl,
          facebookUrl,
          instagramUrl,
          slug: `${profession}-${payload.userId}`.toLowerCase().replace(/\s+/g, '-'),
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating professional profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
