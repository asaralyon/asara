export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    return user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

async function getUpcomingEvents() {
  const today = new Date();
  return prisma.event.findMany({
    where: {
      isPublished: true,
      eventDate: { gte: today }
    },
    orderBy: { eventDate: 'asc' },
    take: 5
  });
}

async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
}

async function getAllMembers() {
  return prisma.user.findMany({
    where: {
      OR: [
        { role: 'MEMBER' },
        { role: 'PROFESSIONAL' },
        { role: 'ADMIN' }
      ]
    },
    select: { email: true, firstName: true, lastName: true }
  });
}

interface NewsLink {
  title: string;
  url: string;
  source: string;
}

function generateNewsletterHTML(customLinks: NewsLink[], events: any[], articles: any[], baseUrl: string) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const linksHTML = customLinks.length > 0 ? customLinks.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <a href="${item.url}" style="color: #2D8C3C; text-decoration: none; font-weight: 600; font-size: 15px;">
          ${item.title}
        </a>
        ${item.source ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Source: ${item.source}</p>` : ''}
      </td>
    </tr>
  `).join('') : '';

  const eventsHTML = events.length > 0 ? events.map(event => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0; font-weight: 600; color: #1f2937;">${event.title}</p>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">
          ${formatDate(event.eventDate)} ${event.location ? `| ${event.location}` : ''}
        </p>
      </td>
    </tr>
  `).join('') : '<tr><td style="padding: 12px 0; color: #6b7280;">Aucun evenement a venir.</td></tr>';

  const articlesHTML = articles.length > 0 ? articles.map(article => `
    <tr>
      <td style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1f2937; font-size: 16px;">${article.title}</p>
        <p style="margin: 0 0 8px; color: #4b5563; font-size: 14px; line-height: 1.6; white-space: pre-line;">
          ${article.content.substring(0, 800)}${article.content.length > 800 ? '...' : ''}
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">Par ${article.authorName}</p>
      </td>
    </tr>
    <tr><td style="height: 12px;"></td></tr>
  `).join('') : '';

  return `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2D8C3C 0%, #1e6b2d 100%); padding: 32px; text-align: center;">
              <img src="${baseUrl}/images/logo.png" alt="ASARA" width="80" style="margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Newsletter ASARA</h1>
              <p style="margin: 8px 0 0; color: #dcfce7; font-size: 14px;">Association des Syriens d'Auvergne Rhone-Alpes</p>
            </td>
          </tr>

          ${customLinks.length > 0 ? `
          <!-- Actualites -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 20px; color: #2D8C3C; font-size: 20px; border-bottom: 2px solid #2D8C3C; padding-bottom: 8px;">
                A lire cette semaine
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${linksHTML}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Evenements -->
          <tr>
            <td style="padding: ${customLinks.length > 0 ? '0 32px 32px' : '32px'};">
              <h2 style="margin: 0 0 20px; color: #2D8C3C; font-size: 20px; border-bottom: 2px solid #2D8C3C; padding-bottom: 8px;">
                Evenements a venir
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${eventsHTML}
              </table>
              <p style="margin: 16px 0 0; text-align: center;">
                <a href="${baseUrl}/fr/evenements" style="display: inline-block; background: #2D8C3C; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Voir tous les evenements
                </a>
              </p>
            </td>
          </tr>

          ${articles.length > 0 ? `
          <!-- Articles des membres -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <h2 style="margin: 0 0 20px; color: #2D8C3C; font-size: 20px; border-bottom: 2px solid #2D8C3C; padding-bottom: 8px;">
                Articles de la communaute
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articlesHTML}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background: #1f2937; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">ASARA Lyon</p>
              <p style="margin: 0 0 16px; color: #9ca3af; font-size: 12px;">
                Association des Syriens d'Auvergne Rhone-Alpes
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                <a href="${baseUrl}/fr" style="color: #9ca3af;">Site web</a> | 
                <a href="${baseUrl}/fr/annuaire" style="color: #9ca3af;">Annuaire</a> | 
                <a href="${baseUrl}/fr/contact" style="color: #9ca3af;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Verifier la configuration SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP config missing:', {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS
      });
      return NextResponse.json({ 
        error: 'Configuration SMTP manquante. Verifiez les variables SMTP_HOST, SMTP_USER, SMTP_PASS dans Vercel.' 
      }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { testEmail, customLinks = [] } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asara-lyon.fr';

    // Recuperer les donnees
    const [events, articles] = await Promise.all([
      getUpcomingEvents(),
      getPublishedArticles()
    ]);

    // Generer le HTML
    const html = generateNewsletterHTML(customLinks, events, articles, baseUrl);

    // Configurer le transporteur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `Newsletter ASARA - ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    if (testEmail) {
      try {
        await transporter.sendMail({
          from: `"ASARA Lyon" <${process.env.SMTP_USER}>`,
          to: testEmail,
          subject: `[TEST] ${subject}`,
          html,
        });
        return NextResponse.json({ success: true, message: 'Email test envoye', recipientCount: 1 });
      } catch (emailError: any) {
        console.error('Email send error:', emailError);
        return NextResponse.json({ 
          error: `Erreur envoi email: ${emailError.message}` 
        }, { status: 500 });
      }
    }

    // Recuperer tous les membres
    const members = await getAllMembers();
    
    if (members.length === 0) {
      return NextResponse.json({ error: 'Aucun membre trouve' }, { status: 400 });
    }

    // Envoi a tous les membres
    let sentCount = 0;
    const errors: string[] = [];
    
    for (const member of members) {
      try {
        await transporter.sendMail({
          from: `"ASARA Lyon" <${process.env.SMTP_USER}>`,
          to: member.email,
          subject,
          html,
        });
        sentCount++;
      } catch (err: any) {
        console.error(`Erreur envoi a ${member.email}:`, err.message);
        errors.push(member.email);
      }
    }

    // Enregistrer l'envoi
    await prisma.newsletter.create({
      data: {
        subject,
        sentAt: new Date(),
        recipientCount: sentCount,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Newsletter envoyee a ${sentCount}/${members.length} membres`,
      recipientCount: sentCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
