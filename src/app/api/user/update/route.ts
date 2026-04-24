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
    const { firstName, lastName, phone, address, city, postalCode } = body;

    // Mise à jour des informations utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId as string },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        postalCode,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
