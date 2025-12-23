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
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (user?.role === 'ADMIN') return user;
    return null;
  } catch {
    return null;
  }
}

function generateEmailHTML(content: string, includeHeader: boolean, includeFooter: boolean, firstName: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asara-lyon.fr';
  
  // Remplacer les variables
  const personalizedContent = content
    .replace(/{firstName}/g, firstName)
    .replace(/\n/g, '<br>');

  const header = includeHeader ? `
    <tr>
      <td style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 32px; text-align: center;">
        <img src="${baseUrl}/images/logo.png" alt="ASARA" width="80" style="margin-bottom: 12px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">ASARA Lyon</h1>
        <p style="margin: 6px 0 0; color: #bbf7d0; font-size: 14px;">Association des Syriens d'Auvergne Rhone-Alpes</p>
      </td>
    </tr>
  ` : '';

  const footer = includeFooter ? `
    <tr>
      <td style="background: #1f2937; padding: 24px; text-align: center;">
        <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 600;">ASARA Lyon</p>
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          <a href="${baseUrl}" style="color: #22c55e; text-decoration: none;">www.asara-lyon.fr</a>
        </p>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          ${header}
          <tr>
            <td style="padding: 32px;">
              <div style="color: #1f2937; font-size: 15px; line-height: 1.8;">
                ${personalizedContent}
              </div>
            </td>
          </tr>
          ${footer}
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
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    // Verifier la configuration SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ 
        error: 'Configuration SMTP manquante' 
      }, { status: 500 });
    }

    const { target, subject, message, includeHeader, includeFooter } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Sujet et message requis' }, { status: 400 });
    }

    // Construire le filtre selon la cible
    let where: any = {};
    
    switch (target) {
      case 'professionals':
        where = { role: 'PROFESSIONAL' };
        break;
      case 'members':
        where = { role: 'MEMBER' };
        break;
      case 'active':
        where = { status: 'ACTIVE' };
        break;
      case 'all':
      default:
        where = {
          OR: [
            { role: 'PROFESSIONAL' },
            { role: 'MEMBER' },
            { role: 'ADMIN' }
          ]
        };
        break;
    }

    // Recuperer les destinataires
    const users = await prisma.user.findMany({
      where,
      select: { email: true, firstName: true, lastName: true }
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'Aucun destinataire trouve' }, { status: 400 });
    }

    // Configurer le transporteur
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Envoyer les emails
    let sentCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        const html = generateEmailHTML(message, includeHeader, includeFooter, user.firstName);
        
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA Lyon" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: subject,
          html,
        });
        sentCount++;
      } catch (err: any) {
        console.error(`Erreur envoi a ${user.email}:`, err.message);
        errors.push(user.email);
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: sentCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
