import { NextResponse } from 'next/server';
import { rateLimitPublic } from '@/lib/rate-limit';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const ip = (request as any).headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await rateLimitPublic.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans 10 minutes.' },
      { status: 429 }
    );
  }
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent etre remplis' },
        { status: 400 }
      );
    }

    const subjectLabels: Record<string, string> = {
      information: 'Demande d information',
      adhesion: 'Question sur l adhesion',
      annuaire: 'Question sur l annuaire',
      evenement: 'Question sur les evenements',
      partenariat: 'Proposition de partenariat',
      autre: 'Autre',
    };

    // Configuration SMTP Infomaniak avec SSL
    const transporter = nodemailer.createTransport({
      host: 'mail.infomaniak.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email à l'association
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'info@asara-lyon.fr',
      replyTo: email,
      subject: `[Contact ASARA] ${subjectLabels[subject] || subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telephone:</strong> ${phone || 'Non renseigne'}</p>
        <p><strong>Sujet:</strong> ${subjectLabels[subject] || subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Email de confirmation à l'expéditeur
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Confirmation de votre message - ASARA',
      html: `
        <h2>Merci de nous avoir contacte !</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien recu votre message concernant : <strong>${subjectLabels[subject] || subject}</strong></p>
        <p>Notre equipe vous repondra dans les plus brefs delais.</p>
        <br>
        <p>Cordialement,</p>
        <p><strong>L'equipe ASARA</strong></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Annuaire des Syriens de France<br>
          Rue Leon Blum, 69150 Decines<br>
          info@asara-lyon.fr
        </p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l envoi du message' },
      { status: 500 }
    );
  }
}