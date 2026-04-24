export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

function getConfirmationEmail(firstName: string, locale: string, baseUrl: string) {
  if (locale === 'ar') {
    return {
      subject: 'تأكيد الاشتراك في النشرة الأسبوعية - ASARA',
      html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 40px; text-align: center;">
              <img src="${baseUrl}/images/logo.png" alt="ASARA France" width="160" style="margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">دليل السوريين في فرنسا</h1>
              <p style="margin: 8px 0 0; color: #bbf7d0; font-size: 16px;">ASARA</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: right;">
              <h2 style="margin: 0 0 20px; color: #166534; font-size: 22px;">مرحبا ${firstName}!</h2>
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                شكرا لاشتراكك في النشرة الأسبوعية لدليل السوريين في فرنسا.
              </p>
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                ستتلقى أخبارا عن فعالياتنا ومقالات من مجتمعنا كل أسبوع.
              </p>
              <p style="margin: 24px 0 0; color: #166534; font-size: 16px; font-weight: 600;">
                فريق ASARA
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #1f2937; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                <a href="${baseUrl}" style="color: #22c55e; text-decoration: none;">www.asara-lyon.fr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };
  }

  return {
    subject: 'Confirmation d\'inscription a la newsletter - ASARA',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 40px; text-align: center;">
              <img src="${baseUrl}/images/logo.png" alt="ASARA France" width="160" style="margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">ASARA</h1>
              <p style="margin: 8px 0 0; color: #bbf7d0; font-size: 14px;">Annuaire des Syriens de France</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #166534; font-size: 22px;">Bonjour ${firstName} !</h2>
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                Merci pour votre inscription a la newsletter de l'Annuaire des Syriens de France.
              </p>
              <p style="margin: 0 0 16px; color: #1f2937; font-size: 16px; line-height: 1.8;">
                Vous recevrez chaque semaine des nouvelles de nos evenements et des articles de notre communaute.
              </p>
              <p style="margin: 24px 0 0; color: #166534; font-size: 16px; font-weight: 600;">
                L'equipe ASARA
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #1f2937; padding: 24px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                <a href="${baseUrl}" style="color: #22c55e; text-decoration: none;">www.asara-lyon.fr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
}

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, locale = 'fr' } = await request.json();

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ 
        error: locale === 'ar' ? 'جميع الحقول مطلوبة' : 'Tous les champs sont requis' 
      }, { status: 400 });
    }

    // Verifier si deja inscrit
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ 
          error: locale === 'ar' ? 'هذا البريد مسجل بالفعل' : 'Cet email est deja inscrit' 
        }, { status: 400 });
      }
      // Reactiver si desactive
      await prisma.subscriber.update({
        where: { email },
        data: { isActive: true, firstName, lastName, locale, confirmedAt: new Date() }
      });
    } else {
      await prisma.subscriber.create({
        data: { email, firstName, lastName, locale, confirmedAt: new Date() }
      });
    }

    // Envoyer email de confirmation
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asara-lyon.fr';
        const emailContent = getConfirmationEmail(firstName, locale, baseUrl);

        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA" <${process.env.SMTP_USER}>`,
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('Email confirmation error:', emailError);
        // Ne pas bloquer l'inscription si l'email echoue
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: locale === 'ar' ? 'تم الاشتراك بنجاح' : 'Inscription reussie' 
    });

  } catch (error: any) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
