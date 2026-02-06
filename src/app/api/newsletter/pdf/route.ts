export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";

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

function toHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

function toGregorianArabic(date: Date): string {
  return new Intl.DateTimeFormat("ar", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

async function getUpcomingEvents() {
  const today = new Date();
  return (prisma as any).event.findMany({
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
  baseUrl: string,
  newsletterDate: Date
) {
  const hijriDate = toHijriDate(newsletterDate);
  const gregorianDate = toGregorianArabic(newsletterDate);
  const eventsUrl = baseUrl + "/ar/evenements";
  const subscribeUrl = baseUrl + "/ar/newsletter";

  const linksHTML =
    customLinks.length > 0
      ? customLinks
          .map(
            (item) => `
    <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; background: #ffffff;">
      <a href="${item.url}" target="_blank" style="color: #166534; text-decoration: underline; font-weight: 700; font-size: 15px; display: block;">
        🔗 ${item.title}
      </a>
      ${
        item.source
          ? `<p style="margin: 4px 0 0; color: #6b7280; font-size: 12px;">المصدر: ${item.source}</p>`
          : ""
      }
    </div>
  `
          )
          .join("")
      : "";

  const eventsHTML =
    events.length > 0
      ? events
          .map(
            (event) => `
    <div style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; background: #ffffff;">
      <a href="${eventsUrl}" target="_blank" style="color: #166534; text-decoration: underline; font-weight: 600; font-size: 15px; display: block; cursor: pointer;">
        📅 ${event.title}
      </a>
      <a href="${eventsUrl}" target="_blank" style="margin: 4px 0 0; color: #166534; font-size: 12px; text-decoration: underline; display: block;">
        ${eventsUrl}
      </a>
    </div>
  `
          )
          .join("")
      : '<div style="padding: 14px 16px; color: #6b7280; background: #ffffff; text-align: center;">لا توجد فعاليات قادمة حالياً</div>';

  const articlesHTML =
    articles.length > 0
      ? articles
          .map(
            (article) => `
    <div style="padding: 20px; background: #f0fdf4; border-radius: 12px; border: 2px solid #86efac; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px; font-weight: 700; color: #166534; font-size: 17px; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">
        ${article.title}
      </h3>
      <div style="color: #1f2937; font-size: 14px; line-height: 2; text-align: right; white-space: pre-line;">
        ${article.content}
      </div>
      <p style="margin: 16px 0 0; padding-top: 12px; border-top: 1px solid #86efac; color: #166534; font-size: 13px; font-weight: 600;">
        ✍️ ${article.authorName}
      </p>
    </div>
  `
          )
          .join("")
      : "";

  const imagesHTML =
    images.length > 0
      ? images
          .map(
            (img) => `
    <div style="margin-bottom: 16px; text-align: center;">
      <img class="nl-img" src="${img.base64}" alt="${
                img.caption || "صورة"
              }" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      ${
        img.caption
          ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 13px; font-style: italic;">${img.caption}</p>`
          : ""
      }
    </div>
  `
          )
          .join("")
      : "";

  // ✅ Wrapper impression fiable : attend que les images soient décodées avant window.print()
  const printHelper = `
<script>
  (function () {
    async function waitForImages() {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }));

      // Décodage (Chrome/Edge) pour éviter impression avant rendu
      await Promise.all(imgs.map(img => (img.decode ? img.decode().catch(()=>{}) : Promise.resolve())));
    }

    window.addEventListener('load', async () => {
      await waitForImages();
      // petit délai pour layout
      setTimeout(() => {
        try { window.focus(); } catch(e){}
        try { window.print(); } catch(e){}
      }, 300);
    });
  })();
</script>
`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>النشرة الأسبوعية - ASARA Lyon</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: #166534 !important; text-decoration: underline !important; }
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #f3f4f6;
      direction: rtl;
    }
    a { color: #166534; }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header avec dates -->
    <div style="background: linear-gradient(135deg, #166534 0%, #14532d 100%); padding: 30px; text-align: center;">
      <div style="margin-bottom: 20px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">جمعية السوريين في أوفيرن رون ألب</h1>
        <p style="margin: 8px 0 0; color: #bbf7d0; font-size: 18px; font-weight: 600;">ASARA Lyon</p>
      </div>

      <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; margin-top: 16px;">
        <p style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">📰 النشرة الأسبوعية</p>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3);">
          <p style="margin: 0; color: #dcfce7; font-size: 16px; font-weight: 600;">${hijriDate}</p>
          <p style="margin: 6px 0 0; color: #bbf7d0; font-size: 14px;">${gregorianDate}</p>
        </div>
      </div>
    </div>

    ${
      images.length > 0
        ? `
    <!-- Images -->
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        📷 صور
      </h2>
      ${imagesHTML}
    </div>
    `
        : ""
    }

    ${
      customLinks.length > 0
        ? `
    <!-- Actualites -->
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        📰 للقراءة هذا الأسبوع
      </h2>
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        ${linksHTML}
      </div>
    </div>
    `
        : ""
    }

    <!-- Evenements -->
    <div style="padding: 0 24px 24px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        🗓️ الفعاليات القادمة
      </h2>
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        ${eventsHTML}
      </div>
      <p style="margin: 16px 0 0; text-align: center;">
        <a href="${eventsUrl}" target="_blank" style="color: #166534; font-size: 14px; font-weight: 600; text-decoration: underline;">
          عرض جميع الفعاليات ← ${eventsUrl}
        </a>
      </p>
    </div>

    ${
      articles.length > 0
        ? `
    <!-- Articles -->
    <div style="padding: 0 24px 24px;">
      <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; font-weight: 700; border-right: 4px solid #22c55e; padding-right: 12px;">
        ✍️ مقالات من المجتمع
      </h2>
      ${articlesHTML}
    </div>
    `
        : ""
    }

    <!-- Newsletter Signup -->
    <div style="padding: 24px; background: #f0fdf4; text-align: center; border-top: 3px solid #22c55e;">
      <p style="margin: 0 0 8px; color: #166534; font-size: 16px; font-weight: 700;">
        📧 للاشتراك في نشرتنا الأسبوعية
      </p>
      <a href="${subscribeUrl}" target="_blank" style="color: #166534; font-size: 14px; text-decoration: underline; font-weight: 600;">
        ${subscribeUrl}
      </a>
    </div>

    <!-- Footer -->
    <div style="background: #1f2937; padding: 24px; text-align: center;">
      <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">جمعية السوريين في أوفيرن رون ألب</p>
      <p style="margin: 0 0 12px; color: #9ca3af; font-size: 13px;">ASARA Lyon</p>
      <a href="${baseUrl}" target="_blank" style="color: #22c55e; font-size: 14px; text-decoration: underline;">www.asara-lyon.fr</a>
    </div>

  </div>

  ${printHelper}
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { customLinks = [], images = [] } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://asara-lyon.fr";

    const [events, articles] = await Promise.all([getUpcomingEvents(), getPublishedArticles()]);

    const html = generateNewsletterHTML(customLinks, events, articles, images, baseUrl, new Date());

    return NextResponse.json({
      success: true,
      html,
      date: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Newsletter PDF error:", error);
    return NextResponse.json({ error: "Erreur: " + error.message }, { status: 500 });
  }
}
