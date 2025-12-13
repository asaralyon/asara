export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function PATCH(request: Request) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Donnees manquantes' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouve' },
        { status: 404 }
      );
    }

    let updateData = {};

    switch (action) {
      case 'approve':
        updateData = { status: 'ACTIVE' };
        // Si professionnel, publier le profil
        await prisma.professionalProfile.updateMany({
          where: { userId },
          data: { isPublished: true, publishedAt: new Date() },
        });
        // Envoyer l'email d'activation
        const activatedTemplate = emailTemplates.accountActivated(user.firstName, user.role);
        await sendEmail({
          to: user.email,
          subject: activatedTemplate.subject,
          html: activatedTemplate.html,
        });
        break;

      case 'suspend':
        updateData = { status: 'SUSPENDED' };
        await prisma.professionalProfile.updateMany({
          where: { userId },
          data: { isPublished: false },
        });
        // Envoyer l'email de suspension
        const suspendedTemplate = emailTemplates.accountSuspended(user.firstName);
        await sendEmail({
          to: user.email,
          subject: suspendedTemplate.subject,
          html: suspendedTemplate.html,
        });
        break;

      case 'activate':
        updateData = { status: 'ACTIVE' };
        await prisma.professionalProfile.updateMany({
          where: { userId },
          data: { isPublished: true },
        });
        // Envoyer l'email de réactivation
        const reactivatedTemplate = emailTemplates.accountActivated(user.firstName, user.role);
        await sendEmail({
          to: user.email,
          subject: reactivatedTemplate.subject,
          html: reactivatedTemplate.html,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Action non valide' },
          { status: 400 }
        );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Supprimer le profil professionnel d'abord (si existe)
    await prisma.professionalProfile.deleteMany({
      where: { userId },
    });

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}