export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Verifier que l utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    // Supprimer l utilisateur
    await prisma.user.delete({
      where: { id: userId }
    });

    // Supprimer le cookie d authentification
    const response = NextResponse.json({ 
      success: true, 
      message: 'Compte supprime avec succes' 
    });
    
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
