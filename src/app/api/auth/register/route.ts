import { NextResponse } from 'next/server';
import { rateLimitAuth } from '@/lib/rate-limit';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = "force-dynamic";

function generateSlug(base: string): string {
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: Request) {
  const ip = (request as any).headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await rateLimitAuth.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    console.log('Register attempt with email:', body.email);

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      // Champs professionnel
      profession,
      category,
      companyName,
      description,
      address,
      city,
      postalCode,
      professionalPhone,
      professionalEmail,
      website,
      // Champs association
      associationName,
      registrationNumber,
      activities,
      assocPhone,
      assocEmail,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      whatsappUrl,
    } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est deja utilise' },
        { status: 400 }
      );
    }

    const passwordHash = await hash(password, 12);

    // Générer un slug de base
    const slugBase =
      role === 'ASSOCIATION'
        ? generateSlug(associationName || `${firstName}-${lastName}`)
        : generateSlug(`${firstName}-${lastName}`);

    // S'assurer que le slug est unique
    let slug = slugBase;
    let counter = 1;

    if (role === 'PROFESSIONAL') {
      while (await prisma.professionalProfile.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${counter++}`;
      }
    } else if (role === 'ASSOCIATION') {
      while (await prisma.associationProfile.findUnique({ where: { slug } })) {
        slug = `${slugBase}-${counter++}`;
      }
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'MEMBER',
        status: 'PENDING',
        emailVerified: false,
      },
    });

    console.log('User created:', user.id);

    // Créer le profil selon le rôle
    if (role === 'PROFESSIONAL') {
      await prisma.professionalProfile.create({
        data: {
          userId: user.id,
          profession,
          category,
          companyName: companyName || null,
          description: description || null,
          address: address || null,
          city,
          postalCode,
          professionalPhone: professionalPhone || null,
          professionalEmail: professionalEmail || null,
          website: website || null,
          slug,
          isPublished: false,
        },
      });
    } else if (role === 'ASSOCIATION') {
      await prisma.associationProfile.create({
        data: {
          userId: user.id,
          associationName,
          registrationNumber: registrationNumber || null,
          activities: activities || null,
          description: description || null,
          address: address || null,
          city,
          postalCode: postalCode || null,
          phone: assocPhone || phone || null,
          email: assocEmail || email || null,
          website: website || null,
          facebookUrl: facebookUrl || null,
          instagramUrl: instagramUrl || null,
          tiktokUrl: tiktokUrl || null,
          whatsappUrl: whatsappUrl || null,
          slug,
          isPublished: false,
        },
      });
    }

    // Email de confirmation à l'utilisateur
    try {
      const template = emailTemplates.inscriptionPending(firstName, role || 'MEMBER');
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error('Email error (non-blocking):', emailError);
    }

    // Notifier l'admin
    try {
      const roleLabel =
        role === 'PROFESSIONAL'
          ? 'Professionnel'
          : role === 'ASSOCIATION'
          ? `Association: ${associationName}`
          : 'Membre';

      const adminUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr') + '/fr/admin/utilisateurs';
      await sendEmail({
        to: 'info@asara-lyon.fr',
        subject: `🔔 Nouvelle inscription en attente — ${firstName} ${lastName} (${roleLabel})`,
        html: `
<!DOCTYPE html>
<html dir="ltr">
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <div style="background: linear-gradient(135deg, #0c2140 0%, #1a3a5c 100%); padding: 30px; text-align: center;">
      <img src="https://asara-lyon.fr/images/logo.png" alt="ASARA" width="120" style="margin-bottom: 12px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🔔 Nouvelle inscription en attente</h1>
    </div>

    <div style="padding: 30px;">
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 16px;">
          ⏳ Action requise : Valider ou refuser cette inscription
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px; width: 140px;">Nom complet</td>
          <td style="padding: 12px 0; font-weight: bold; color: #1f2937;">${firstName} ${lastName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Email</td>
          <td style="padding: 12px 0; color: #1f2937;"><a href="mailto:${email}" style="color: #0c2140;">${email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Type</td>
          <td style="padding: 12px 0;">
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">
              ${roleLabel}
            </span>
          </td>
        </tr>
        ${role === 'PROFESSIONAL' ? `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Profession</td>
          <td style="padding: 12px 0; color: #1f2937;">${profession}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Catégorie</td>
          <td style="padding: 12px 0; color: #1f2937;">${category}</td>
        </tr>
        ${city ? `<tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Ville</td><td style="padding: 12px 0; color: #1f2937;">${city}</td></tr>` : ''}
        ` : ''}
        ${role === 'ASSOCIATION' ? `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Association</td>
          <td style="padding: 12px 0; color: #1f2937;">${associationName}</td>
        </tr>
        ${activities ? `<tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Activités</td><td style="padding: 12px 0; color: #1f2937;">${activities}</td></tr>` : ''}
        ${city ? `<tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Ville</td><td style="padding: 12px 0; color: #1f2937;">${city}</td></tr>` : ''}
        ` : ''}
        <tr>
          <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Date</td>
          <td style="padding: 12px 0; color: #1f2937;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${adminUrl}" 
           style="display: inline-block; background: #0c2140; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          👤 Gérer les inscriptions →
        </a>
      </div>
    </div>

    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">ASARA — Annuaire des Syriens de France</p>
      <p style="margin: 4px 0 0; color: #9ca3af; font-size: 12px;">www.asara-lyon.fr</p>
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error('Admin email error (non-blocking):', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription reussie',
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l inscription' },
      { status: 500 }
    );
  }
}