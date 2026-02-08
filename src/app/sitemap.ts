import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ✅ Base URL configurable (Vercel/prod/staging)
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://asara-lyon.fr').replace(/\/$/, '');

  // Pages statiques
  const staticPages = [
    '',
    '/annuaire',
    '/evenements',
    '/contact',
    '/adhesion',
    '/adhesion/membre',
    '/adhesion/professionnel',
    '/connexion',
  ];

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = staticPages.flatMap((page) => {
    const priority = page === '' ? 1 : 0.8;

    return [
      {
        url: `${baseUrl}/fr${page}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority,
      },
      {
        url: `${baseUrl}/ar${page}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority,
      },
    ];
  });

  /**
   * ✅ Fix build: si pas de DATABASE_URL, on ne tente pas Prisma.
   * (évite PrismaClientInitializationError au build)
   */
  if (!process.env.DATABASE_URL) {
    console.warn('Sitemap: DATABASE_URL missing -> returning static sitemap only');
    return staticUrls;
  }

  // Pages dynamiques - Professionnels
  try {
    const professionals = await prisma.professionalProfile.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    const professionalUrls: MetadataRoute.Sitemap = professionals.flatMap((pro) => [
      {
        url: `${baseUrl}/fr/annuaire/${pro.slug}`,
        lastModified: pro.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/ar/annuaire/${pro.slug}`,
        lastModified: pro.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]);

    return [...staticUrls, ...professionalUrls];
  } catch (error) {
    // ✅ fallback safe
    console.error('Sitemap: Error fetching professionals', error);
    return staticUrls;
  }
}
