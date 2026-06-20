// src/app/api/newsletter/send/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getJwtSecret } from '@/lib/jwt';

async function verifyAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    return user?.role === "ADMIN";
  } catch { return false; }
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { isPublished: true, eventDate: { gte: new Date() } },
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
  const members = await prisma.user.findMany({
    where: { OR: [{ role: "MEMBER" }, { role: "PROFESSIONAL" }, { role: "ADMIN" }], newsletterOptIn: true },
    select: { email: true, firstName: true, lastName: true },
  });
  const subscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: { email: true, firstName: true, lastName: true },
  });
  const allEmails = new Map<string, { email: string; firstName: string; lastName: string }>();
  members.forEach((m) => { if (m.email) allEmails.set(m.email, { email: m.email, firstName: m.firstName, lastName: m.lastName }); });
  subscribers.forEach((s) => { if (s.email && !allEmails.has(s.email)) allEmails.set(s.email, { email: s.email, firstName: s.firstName, lastName: s.lastName }); });
  return { recipients: Array.from(allEmails.values()), membersCount: members.length, subscribersCount: subscribers.length };
}

interface NewsLink { title: string; url: string; source: string; }
interface NewsletterImage { id: string; base64: string; caption: string; }

// ── Helpers tracking ───────────────────────────────────────────────────────

function encodeB64(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function trackedLink(baseUrl: string, newsletterId: string, email: string, destination: string, label: string): string {
  const params = new URLSearchParams({
    n: newsletterId,
    e: encodeB64(email),
    u: encodeB64(destination),
    l: encodeB64(label),
  });
  return `${baseUrl}/api/newsletter/track/click?${params.toString()}`;
}

function trackingPixel(baseUrl: string, newsletterId: string, email: string): string {
  const params = new URLSearchParams({ n: newsletterId, e: encodeB64(email) });
  return `${baseUrl}/api/newsletter/track/open?${params.toString()}`;
}

// ── Générateur HTML ────────────────────────────────────────────────────────

function generateNewsletterHTML(
  customLinks: NewsLink[],
  events: any[],
  articles: any[],
  images: NewsletterImage[],
  baseUrl: string,
  newsletterId: string,
  recipientEmail: string
) {
  const formatDateFr = (date: Date) =>
    new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const formatContent = (content: string) =>
    content
      .replace(/\n\n/g, '</p><p style="margin:12px 0;color:#1f2937;font-size:15px;line-height:2;">')
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1f2937;">$1</strong>');

  const linksHTML = customLinks.map((item) => {
    const href = trackedLink(baseUrl, newsletterId, recipientEmail, item.url, item.title);
    return `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #d1d5db;background:#fff;" dir="rtl">
        <a href="${href}" style="color:#166534;text-decoration:none;font-weight:700;font-size:16px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">${item.title}</a>
        ${item.source ? `<p style="margin:6px 0 0;color:#4b5563;font-size:13px;">المصدر: ${item.source}</p>` : ""}
      </td>
    </tr>`;
  }).join("");

  const eventsHTML = events.length > 0
    ? events.map((ev) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #d1d5db;background:#fff;">
        <p style="margin:0;font-weight:600;color:#1f2937;font-size:15px;">${ev.title}</p>
        <p style="margin:6px 0 0;color:#4b5563;font-size:14px;">${formatDateFr(ev.eventDate)}${ev.location ? ` | ${ev.location}` : ""}</p>
      </td>
    </tr>`).join("")
    : '<tr><td style="padding:14px 16px;color:#4b5563;background:#fff;" dir="rtl">لا توجد فعاليات قادمة حالياً</td></tr>';

  const articlesHTML = articles.map((article) => `
    <tr>
      <td style="padding:24px;background:#f0fdf4;border-radius:12px;border:2px solid #86efac;" dir="rtl">
        <h3 style="margin:0 0 16px;font-weight:700;color:#166534;font-size:20px;border-bottom:3px solid #22c55e;padding-bottom:12px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">${article.title}</h3>
        <div style="color:#1f2937;font-size:15px;line-height:2;text-align:right;">
          <p style="margin:0;color:#1f2937;font-size:15px;line-height:2;">${formatContent(article.content)}</p>
        </div>
        <p style="margin:20px 0 0;padding-top:12px;border-top:2px solid #86efac;color:#166534;font-size:14px;font-weight:600;">${article.authorName}</p>
      </td>
    </tr>
    <tr><td style="height:20px;"></td></tr>`).join("");

  const imagesHTML = images.map((img) => `
    <tr>
      <td style="padding:20px 32px 0;" dir="rtl">
        <div style="text-align:center;margin-bottom:16px;">
          <img src="${img.base64}" alt="${img.caption || "Image"}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />
          ${img.caption ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;font-style:italic;">${img.caption}</p>` : ""}
        </div>
      </td>
    </tr>`).join("");

  const subscribeUrl = `${baseUrl}/ar/newsletter#inscription`;
  const trackedSubscribeUrl = trackedLink(baseUrl, newsletterId, recipientEmail, subscribeUrl, "CTA_INSCRIPTION");
  const whatsappText = encodeURIComponent(`النشرة الأسبوعية من دليل السوريين في فرنسا ASARA: ${baseUrl}/ar/newsletter`);
  const trackedWhatsappUrl = trackedLink(baseUrl, newsletterId, recipientEmail, `https://wa.me/?text=${whatsappText}`, "CTA_WHATSAPP");

  const subscribeCtaHTML = `
  <tr>
    <td style="padding:0 24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#166534 0%,#14532d 100%);border-radius:16px;overflow:hidden;">
        <tr>
          <td style="padding:32px 24px;text-align:center;" dir="rtl">
            <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;line-height:56px;font-size:28px;">🔔</div>
            <h2 style="margin:0 0 10px;color:#fff;font-size:22px;font-weight:700;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">هل أعجبتك هذه النشرة؟</h2>
            <p style="margin:0 0 8px;color:#bbf7d0;font-size:15px;line-height:1.7;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">اشترك مجاناً وستصلك النشرة كل أسبوع مباشرة في بريدك</p>
            <p style="margin:0 0 24px;color:#86efac;font-size:13px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">أخبار · فعاليات · مقالات المجتمع السوري في فرنسا</p>
            <a href="${trackedSubscribeUrl}" style="display:inline-block;background:#fff;color:#166534;font-size:17px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
              📧 اشترك في النشرة — مجاناً
            </a>
            <p style="margin:20px 0 12px;color:#6ee7b7;font-size:13px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">— أو شارك هذه النشرة مع أصدقائك —</p>
            <a href="${trackedWhatsappUrl}" style="display:inline-block;background:#25D366;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:11px 28px;border-radius:50px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
              📲 شارك على واتساب
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

  const pixelURL = trackingPixel(baseUrl, newsletterId, recipientEmail);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#e5e7eb;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#e5e7eb;padding:40px 20px;">
    <tr><td align="center">
      <table width="650" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.15);">
        <tr>
          <td style="background:linear-gradient(135deg,#166534 0%,#14532d 100%);padding:40px;text-align:center;">
            <img src="${baseUrl}/images/logo.png" alt="ASARA" width="200" style="margin-bottom:20px;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">دليل السوريين في فرنسا</h1>
            <p style="margin:12px 0 0;color:#bbf7d0;font-size:22px;font-weight:700;">ASARA</p>
            <p style="margin:16px 0 0;color:#d1fae5;font-size:18px;font-weight:600;">النشرة الأسبوعية</p>
          </td>
        </tr>
        ${imagesHTML}
        ${customLinks.length > 0 ? `
        <tr>
          <td style="padding:32px 32px 24px;">
            <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;font-weight:700;text-align:right;border-right:4px solid #22c55e;padding-right:12px;" dir="rtl">📰 للقراءة هذا الأسبوع</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #d1d5db;">${linksHTML}</table>
          </td>
        </tr>` : ""}
        <tr>
          <td style="padding:${customLinks.length > 0 ? "0 32px 24px" : "32px 32px 24px"};">
            <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;font-weight:700;text-align:right;border-right:4px solid #22c55e;padding-right:12px;" dir="rtl">🗓️ الفعاليات القادمة</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #d1d5db;">${eventsHTML}</table>
          </td>
        </tr>
        ${articles.length > 0 ? `
        <tr>
          <td style="padding:8px 32px 32px;">
            <h2 style="margin:0 0 20px;color:#1f2937;font-size:22px;font-weight:700;text-align:right;border-right:4px solid #22c55e;padding-right:12px;" dir="rtl">✍️ مقالات من المجتمع</h2>
            <table width="100%" cellpadding="0" cellspacing="0">${articlesHTML}</table>
          </td>
        </tr>` : ""}
        ${subscribeCtaHTML}
        <tr>
          <td style="background:linear-gradient(135deg,#1f2937 0%,#111827 100%);padding:32px;text-align:center;">
            <p style="margin:0 0 8px;color:#fff;font-size:20px;font-weight:700;">دليل السوريين في فرنسا</p>
            <p style="margin:0 0 8px;color:#d1d5db;font-size:16px;font-weight:600;">ASARA</p>
            <p style="margin:16px 0 0;"><a href="${baseUrl}" style="color:#22c55e;text-decoration:none;font-size:15px;font-weight:500;">www.asara-lyon.fr</a></p>
            <img src="${pixelURL}" width="1" height="1" style="display:block;border:0;" alt="" />
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── POST handler ───────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json({ error: "Configuration SMTP manquante." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const { testEmail, customLinks = [], images = [] } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asara-lyon.fr";

    const [events, articles] = await Promise.all([getUpcomingEvents(), getPublishedArticles()]);
    const subject = `النشرة الأسبوعية - ASARA - ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });

    // ── Mode test ────────────────────────────────────────────────────────
    if (testEmail) {
      const testNewsletter = await prisma.newsletter.create({
        data: { subject: `[TEST] ${subject}`, sentAt: new Date(), recipientCount: 0 },
      });
      const html = generateNewsletterHTML(customLinks, events, articles, images, baseUrl, testNewsletter.id, testEmail);
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA" <${process.env.SMTP_USER}>`,
          to: testEmail, subject: `[TEST] ${subject}`, html,
        });
        await prisma.newsletter.update({ where: { id: testNewsletter.id }, data: { htmlContent: html } });
        return NextResponse.json({ success: true, message: "Email test envoyé", recipientCount: 1 });
      } catch (emailError: any) {
        await prisma.newsletter.delete({ where: { id: testNewsletter.id } });
        return NextResponse.json({ error: `Erreur envoi email: ${emailError.message}` }, { status: 500 });
      }
    }

    // ── Mode envoi réel ──────────────────────────────────────────────────
    const { recipients, membersCount, subscribersCount } = await getAllRecipients();
    if (recipients.length === 0) return NextResponse.json({ error: "Aucun destinataire trouvé" }, { status: 400 });

    const newsletter = await prisma.newsletter.create({
      data: { subject, sentAt: new Date(), recipientCount: 0 },
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const html = generateNewsletterHTML(customLinks, events, articles, images, baseUrl, newsletter.id, recipient.email);
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"ASARA" <${process.env.SMTP_USER}>`,
          to: recipient.email, subject, html,
        });
        sentCount++;
      } catch (err: any) {
        console.error(`Erreur envoi à ${recipient.email}:`, err.message);
        errors.push(recipient.email);
      }
    }

    const sampleHtml = generateNewsletterHTML(customLinks, events, articles, images, baseUrl, newsletter.id, "preview@asara-lyon.fr");
    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { recipientCount: sentCount, htmlContent: sampleHtml },
    });

    return NextResponse.json({
      success: true,
      message: `Newsletter envoyée à ${sentCount} destinataires (${membersCount} membres + ${subscribersCount} inscrits)`,
      recipientCount: sentCount,
      newsletterId: newsletter.id,
      details: { members: membersCount, subscribers: subscribersCount },
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message}` }, { status: 500 });
  }
}