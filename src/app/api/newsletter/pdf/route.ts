export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

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

// Conversion date Hijri
function toHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
}

function toGregorianArabic(date: Date): string {
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
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

interface NewsLink {
  title: string;
  url: string;
  source: string;
}

function generateNewsletterHTML(
  customLinks: NewsLink[], 
  events: any[], 
  articles: any[], 
  baseUrl: string,
  newsletterDate: Date
) {
  const hijriDate = toHijriDate(newsletterDate);
  const gregorianDate = toGregorianArabic(newsletterDate);

  const linksHTML = customLinks.length > 0 ? customLinks.map(item => `
    <div style="padding: 12px 16px; border-bottom: 1px solid #d1d5db; background: #ffffff;">
      <a href="${item.url}" style="color: #166534; text-decoration: none; font-weight: 700; font-size: 14px;">
        ${item.title}
      </a>
      ${item.source ? `<p style="margin: 4px 0 0; color: #4b5563; font-size: 11px;">المصدر: ${item.source}</p>` : ''}
    </div>
  `).join('') : '';

  const eventsHTML = events.length > 0 ? events.map(event => `
    <div style="padding: 10px 16px; border-bottom: 1px solid #d1d5db; background: #ffffff;">
      <a href="${baseUrl}/ar/evenements" style="color: #166534; text-decoration: none; font-weight: 600; font-size: 14px;">
        📅 ${event.title}
      </a>
    </div>
  `).join('') : '<div style="padding: 12px 16px; color: #4b5563; background: #ffffff;">لا توجد فعاليات قادمة حالياً</div>';

  const articlesHTML = articles.length > 0 ? articles.map(article => `
    <div style="padding: 20px; background: #f0fdf4; border-radius: 8px; border: 2px solid #86efac; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; font-weight: 700; color: #166534; font-size: 16px; border-bottom: 2px solid #22c55e; padding-bottom: 8px;">
        ${article.title}
      </h3>
      <div style="color: #1f2937; font-size: 13px; line-height: 1.9; text-align: right; white-space: pre-line;">
        ${article.content}
      </div>
      <p style="margin: 16px 0 0; padding-top: 10px; border-top: 1px solid #86efac; color: #166534; font-size: 12px; font-weight: 600;">
        ✍️ ${article.authorName}
      </p>
    </div>
  `).join('') : '';

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page { margin: 20px; size: A4; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #ffffff;
      direction: rtl;
    }
    a { color: #166534; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div style="max-width: 595px; margin: 0 auto; background: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 30px; text-align: center;">
      <img src="${baseUrl}/images/logo.png" alt="ASARA" width="80" style="margin-bottom: 12px;">
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">جمعية السوريين في أوفيرن رون ألب</h1>
      <p style="margin: 8px 0 0; color: #bbf7d0; font-size: 16px; font-weight: 600;">ASARA Lyon</p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3);">
        <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">النشرة الأسبوعية</p>
        <p style="margin: 8px 0 0; color: #dcfce7; font-size: 13px;">${hijriDate}</p>
        <p style="margin: 4px 0 0; color: #dcfce7; font-size: 13px;">${gregorianDate}</p>
      </div>
    </div>

    ${customLinks.length > 0 ? `
    <!-- Actualites -->
    <div style="padding: 24px 24px 16px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        📰 للقراءة هذا الأسبوع
      </h2>
      <div style="border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db;">
        ${linksHTML}
      </div>
    </div>
    ` : ''}

    <!-- Evenements -->
    <div style="padding: 0 24px 16px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        🗓️ الفعاليات القادمة
      </h2>
      <div style="border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db;">
        ${eventsHTML}
      </div>
      <p style="margin: 12px 0 0; text-align: center;">
        <a href="${baseUrl}/ar/evenements" style="color: #166534; font-size: 13px; font-weight: 600;">
          عرض جميع الفعاليات ←
        </a>
      </p>
    </div>

    ${articles.length > 0 ? `
    <!-- Articles -->
    <div style="padding: 8px 24px 24px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        ✍️ مقالات من المجتمع
      </h2>
      ${articlesHTML}
    </div>
    ` : ''}

    <!-- Newsletter Signup -->
    <div style="padding: 20px 24px; background: #f0fdf4; text-align: center; border-top: 2px solid #22c55e;">
      <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">
        للاشتراك في نشرتنا الأسبوعية
      </p>
      <a href="${baseUrl}/ar/newsletter" style="color: #166534; font-size: 13px; text-decoration: underline;">
        ${baseUrl}/ar/newsletter
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 24px; text-align: center;">
      <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">جمعية السوريين في أوفيرن رون ألب</p>
      <p style="margin: 0 0 12px; color: #d1d5db; font-size: 12px;">ASARA Lyon</p>
      <a href="${baseUrl}" style="color: #22c55e; font-size: 13px;">www.asara-lyon.fr</a>
    </div>

  </div>
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

    const body = await request.json().catch(() => ({}));
    const { customLinks = [] } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asara-lyon.fr';

    const [events, articles] = await Promise.all([
      getUpcomingEvents(),
      getPublishedArticles()
    ]);

    const html = generateNewsletterHTML(customLinks, events, articles, baseUrl, new Date());

    // Retourner le HTML pour conversion côté client
    return NextResponse.json({ 
      success: true, 
      html,
      date: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Newsletter PDF error:', error);
    return NextResponse.json({ error: `Erreur: ${error.message}` }, { status: 500 });
  }
}
