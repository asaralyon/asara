import { NextResponse } from 'next/server';
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

      await sendEmail({
        to: 'info@asara-france.fr',
        subject: `Nouvelle inscription - ${firstName} ${lastName}`,
        html: `
          <h2>Nouvelle inscription sur ASARA</h2>
          <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Type:</strong> ${roleLabel}</p>
          ${role === 'PROFESSIONAL' ? `<p><strong>Profession:</strong> ${profession}</p>` : ''}
          ${role === 'ASSOCIATION' ? `<p><strong>Activités:</strong> ${activities}</p>` : ''}
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/utilisateurs">Voir dans l'admin</a></p>
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