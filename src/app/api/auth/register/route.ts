import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Register attempt with email:', body?.email);

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,

      // Pro fields
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
    } = body;

    // Guard rails minimum (évite des créations "vides")
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log('Existing user found:', existingUser ? 'YES' : 'NO');

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est deja utilise' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await hash(password, 12);

    // Normaliser le rôle
    const finalRole = role === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'MEMBER';

    // Slug uniquement utile pour les pros
    const baseSlug = `${firstName}-${lastName}`
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    if (finalRole === 'PROFESSIONAL') {
      while (await prisma.professionalProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    /**
     * ✅ Enregistrement address/city/postalCode côté MEMBER
     * - Pour MEMBER: on stocke dans User (address/city/postalCode)
     * - Pour PROFESSIONAL: on garde User minimal (optionnellement on peut aussi stocker,
     *   mais tu stockes déjà dans professionalProfile -> on évite la duplication)
     */
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: finalRole,
        status: 'PENDING',
        emailVerified: false,

        ...(finalRole === 'MEMBER'
          ? {
              address: address || null,
              city: city || null,
              postalCode: postalCode || null,
            }
          : {}),
      },
    });

    console.log('User created:', user.id);

    // Si professionnel, créer le profil
    if (finalRole === 'PROFESSIONAL') {
      // Validation minimale pro (tu peux durcir selon tes règles)
      if (!profession || !category) {
        return NextResponse.json(
          { error: 'Champs professionnels obligatoires manquants' },
          { status: 400 }
        );
      }

      await prisma.professionalProfile.create({
        data: {
          userId: user.id,
          profession,
          category,
          companyName: companyName || null,
          description: description || null,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
          professionalPhone: professionalPhone || null,
          professionalEmail: professionalEmail || null,
          website: website || null,
          slug,
          isPublished: false,
        },
      });
    }

    // Envoyer l'email de confirmation (non bloquant)
    try {
      const template = emailTemplates.inscriptionPending(firstName, finalRole);
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error('Email error (non-blocking):', emailError);
    }

    // Notifier l'admin (non bloquant)
    try {
      await sendEmail({
        to: 'info@asara-lyon.fr',
        subject: `Nouvelle inscription - ${firstName} ${lastName}`,
        html: `
          <h2>Nouvelle inscription sur ASARA</h2>
          <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Type:</strong> ${
            finalRole === 'PROFESSIONAL' ? 'Professionnel' : 'Membre'
          }</p>
          ${
            finalRole === 'PROFESSIONAL'
              ? `<p><strong>Profession:</strong> ${profession}</p>`
              : ''
          }
          <p><a href="${
            process.env.NEXT_PUBLIC_APP_URL
          }/admin/utilisateurs">Voir dans l'admin</a></p>
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
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
