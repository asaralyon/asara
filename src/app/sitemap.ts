import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://asara-lyon.fr';
  
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

  const staticUrls = staticPages.flatMap((page) => [
    {
      url: baseUrl + '/fr' + page,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    },
    {
      url: baseUrl + '/ar' + page,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    },
  ]);

  // Pages dynamiques - Professionnels
  let professionalUrls: MetadataRoute.Sitemap = [];
  try {
    const professionals = await prisma.professionalProfile.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    professionalUrls = professionals.flatMap((pro) => [
      {
        url: baseUrl + '/fr/annuaire/' + pro.slug,
        lastModified: pro.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: baseUrl + '/ar/annuaire/' + pro.slug,
        lastModified: pro.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
    ]);
  } catch (error) {
    console.error('Sitemap: Error fetching professionals', error);
  }

  return [...staticUrls, ...professionalUrls];
}
