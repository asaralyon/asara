import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Toujours retourner succès pour éviter l'énumération d'emails
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Générer un token unique
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Construire le lien
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr';
    const resetLink = baseUrl + '/fr/reinitialiser-mot-de-passe?token=' + resetToken;

    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - ASARA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f0f0f0;">
          <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2D8C3C 0%, #1a5c26 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">ASARA</h1>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Bonjour ${user.firstName},</h2>
              <p style="color: #666; line-height: 1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe.
              </p>
              <p style="color: #666; line-height: 1.6;">
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #2D8C3C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                Ce lien expirera dans 1 heure.<br>
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                <a href="${resetLink}" style="color: #2D8C3C; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
