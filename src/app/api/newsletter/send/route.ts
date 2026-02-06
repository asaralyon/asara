export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

async function getUpcomingEvents() {
  const today = new Date();
  return prisma.event.findMany({
    where: {
      isPublished: true,
      eventDate: { gte: today },
    },
    orderBy: { eventDate: "asc" },
    take: 5,
  });
}

async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getAllRecipients() {
  // Membres de l'association
  const members = await prisma.user.findMany({
    where: {
      OR: [{ role: "MEMBER" }, { role: "PROFESSIONAL" }, { role: "ADMIN" }],
      newsletterOptIn: true,
    },
    select: { email: true, firstName: true, lastName: true },
  });

  // Inscrits a la newsletter
  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: { email: true, firstName: true, lastName: true },
  });

  // Fusionner et dedupliquer par email
  const allEmails = new Map<string, { email: string; firstName: string; lastName: string }>();

  members.forEach((m) => {
    if (m.email) {
      allEmails.set(m.email, {
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
      });
    }
  });

  subscribers.forEach((s) => {
    if (s.email && !allEmails.has(s.email)) {
      allEmails.set(s.email, {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
      });
    }
  });

  return {
    recipients: Array.from(allEmails.values()),
    membersCount: members.length,
    subscribersCount: subscribers.length,
  };
}

interface NewsLink {
  title: string;
  url: string;
  source: string;
}

interface NewsletterImage {
  id: string;
  base64: string;
  caption: string;
}

function generateNewsletterHTML(
  customLinks: NewsLink[],
  events: any[],
  articles: any[],
  images: NewsletterImage[],
  baseUrl: string
) {
  const formatDateFr = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatContent = (content: string) => {
    return content
      .replace(
        /\n\n/g,
        '</p><p style="margin: 12px 0; color: #1f2937; font-size: 15px; line-height: 2;">'
      )
      .replace(/\n/g, "<br>")
      .replace(
        /### (.*?)(<br>|<\/p>)/g,
        '<strong style="color: #166534; font-size: 16px; display: block; margin-top: 16px;">$1</strong>$2'
      )
      .replace(
        /## (.*?)(<br>|<\/p>)/g,
        '<strong style="color: #166534; font-size: 17px; display: block; margin-top: 20px;">$1</strong>$2'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937;">$1</strong>');
  };

  const linksHTML =
    customLinks.length > 0
      ? customLinks
          .map(
            (item) => `
    <tr>
      <td style="padding: 14px 16px; border-bottom: 1px solid #d1d5db; background: #ffffff;" dir="rtl">
        <a href="${item.url}" style="color: #166534; text-decoration: none; font-weight: 700; font-size: 16px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
          ${item.title}
        </a>
        ${item.source ? `<p style="margin: 6px 0 0; color: #4b5563; font-size: 13px;">المصدر: ${item.source}</p>` : ""}
      </td>
    </tr>
  `
          )
          .join("")
      : "";

  const eventsHTML =
    events.length > 0
      ? events
          .map(
            (event) => `
    <tr>
      <td style="padding: 14px 16px; border-bottom: 1px solid #d1d5db; background: #ffffff;">
        <p style="margin: 0; font-weight: 600; color: #1f2937; font-size: 15px;">${event.title}</p>
        <p style="margin: 6px 0 0; color: #4b5563; font-size: 14px;">
          ${formatDateFr(event.eventDate)} ${event.location ? `| ${event.location}` : ""}
        </p>
      </td>
    </tr>
  `
          )
          .join("")
      : '<tr><td style="padding: 14px 16px; color: #4b5563; background: #ffffff;" dir="rtl">لا توجد فعاليات قادمة حالياً</td></tr>';

  const articlesHTML =
    articles.length > 0
      ? articles
          .map(
            (article) => `
    <tr>
      <td style="padding: 24px; background: #f0fdf4; border-radius: 12px; border: 2px solid #86efac;" dir="rtl">
        <h3 style="margin: 0 0 16px; font-weight: 700; color: #166534; font-size: 20px; border-bottom: 3px solid #22c55e; padding-bottom: 12px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
          ${article.title}
        </h3>
        <div style="color: #1f2937; font-size: 15px; line-height: 2; text-align: right; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
          <p style="margin: 0; color: #1f2937; font-size: 15px; line-height: 2;">
            ${formatContent(article.content)}
          </p>
        </div>
        <p style="margin: 20px 0 0; padding-top: 12px; border-top: 2px solid #86efac; color: #166534; font-size: 14px; font-weight: 600;">
          ${article.authorName}
        </p>
      </td>
    </tr>
    <tr><td style="height: 20px;"></td></tr>
  `
          )
          .join("")
      : "";

  // ✅ Images sous le header (mode A)
  const imagesHTML =
    images && images.length > 0
      ? images
          .map(
            (img) => `
    <tr>
      <td style="padding: 20px 32px 0;" dir="rtl">
        <div style="text-align: center; margin-bottom: 16px;">
          <img
            src="${img.base64}"
            alt="${img.caption || "Image"}"
            style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
          />
          ${
            img.caption
              ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 13px; font-style: italic;">${img.caption}</p>`
              : ""
          }
        </div>
      </td>
    </tr>
  `
          )
          .join("")
      : "";

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #e5e7eb; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e5e7eb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 40px; text-align: center;">
              <img src="${baseUrl}/images/logo.png" alt="ASARA" width="100" style="margin-bottom: 20px;">
              <h1 style="margin: 0; color: #166534; font-size: 26px; font-weight: 700;">
                جمعية السوريين في أوفيرن رون ألب
              </h1>
              <p style="margin: 12px 0 0; color: #166534; font-size: 22px; font-weight: 700;">ASARA Lyon</p>
              <p style="margin: 16px 0 0; color: #166534; font-size: 18px; font-weight: 600;">
                النشرة الأسبوعية
              </p>
            </td>
          </tr>

          ${imagesHTML}

          ${
            customLinks.length > 0
              ? `
          <!-- Actualites -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 700; text-align: right; border-right: 4px solid #22c55e; padding-right: 12px;" dir="rtl">
                📰 للقراءة هذا الأسبوع
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db;">
                ${linksHTML}
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Evenements -->
          <tr>
            <td style="padding: ${customLinks.length > 0 ? "0 32px 24px" : "32px 32px 24px"};">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 700; text-align: right; border-right: 4px solid #22c55e; padding-right: 12px;" dir="rtl">
                🗓️ الفعاليات القادمة
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db;">
                ${eventsHTML}
              </table>
            </td>
          </tr>

          ${
            articles.length > 0
              ? `
          <!-- Articles des membres -->
          <tr>
            <td style="padding: 8px 32px 32px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 700; text-align: right; border-right: 4px solid #22c55e; padding-right: 12px;" dir="rtl">
                ✍️ مقالات من المجتمع
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articlesHTML}
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px; color: #ffffff; font-size: 20px; font-weight: 700;">جمعية السوريين في أوفيرن رون ألب</p>
              <p style="margin: 0 0 8px; color: #d1d5db; font-size: 16px; font-weight: 600;">ASARA Lyon</p>
              <p style="margin: 16px 0 0;">
                <a href="${baseUrl}" style="color: #22c55e; text-decoration: none; font-size: 15px; font-weight: 500;">www.asara-lyon.fr</a>
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
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        {
          error:
            "Configuration SMTP manquante. Verifiez les variables SMTP_HOST, SMTP_USER, SMTP_PASSWORD dans Vercel.",
        },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { testEmail, customLinks = [], images = [] } = body;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asara-lyon.fr";

    const [events, articles] = await Promise.all([getUpcomingEvents(), getPublishedArticles()]);

    const html = generateNewsletterHTML(customLinks, events, articles, images, baseUrl);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const subject = `النشرة الأسبوعية - ASARA Lyon - ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    if (testEmail) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA Lyon" <${process.env.SMTP_USER}>`,
          to: testEmail,
          subject: `[TEST] ${subject}`,
          html,
        });
        return NextResponse.json({ success: true, message: "Email test envoye", recipientCount: 1 });
      } catch (emailError: any) {
        console.error("Email send error:", emailError);
        return NextResponse.json({ error: `Erreur envoi email: ${emailError.message}` }, { status: 500 });
      }
    }

    // Recuperer tous les destinataires (membres + subscribers)
    const { recipients, membersCount, subscribersCount } = await getAllRecipients();

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire trouve" }, { status: 400 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA Lyon" <${process.env.SMTP_USER}>`,
          to: recipient.email,
          subject,
          html,
        });
        sentCount++;
      } catch (err: any) {
        console.error(`Erreur envoi a ${recipient.email}:`, err.message);
        errors.push(recipient.email);
      }
    }

    await prisma.newsletter.create({
      data: {
        subject,
        sentAt: new Date(),
        recipientCount: sentCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Newsletter envoyee a ${sentCount} destinataires (${membersCount} membres + ${subscribersCount} inscrits)`,
      recipientCount: sentCount,
      details: { members: membersCount, subscribers: subscribersCount },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}
