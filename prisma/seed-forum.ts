import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding forum categories...');

  const categories = [
    {
      name: 'Questions générales',
      nameAr: 'أسئلة عامة',
      slug: 'questions-generales',
      description: 'Posez vos questions sur la vie associative, les démarches...',
      color: '#16a34a',
      order: 1,
    },
    {
      name: 'Vie à Lyon',
      nameAr: 'الحياة في ليون',
      slug: 'vie-a-lyon',
      description: 'Tout ce qui concerne la vie quotidienne à Lyon',
      color: '#2563eb',
      order: 2,
    },
    {
      name: 'Droits & Démarches',
      nameAr: 'الحقوق والإجراءات',
      slug: 'droits-demarches',
      description: 'Informations sur vos droits et les démarches administratives',
      color: '#7c3aed',
      order: 3,
    },
    {
      name: 'Emploi & Formation',
      nameAr: 'التوظيف والتدريب',
      slug: 'emploi-formation',
      description: 'Offres, conseils, formations et orientation professionnelle',
      color: '#ea580c',
      order: 4,
    },
    {
      name: 'Logement',
      nameAr: 'السكن',
      slug: 'logement',
      description: 'Aide au logement, droits des locataires, annonces',
      color: '#0891b2',
      order: 5,
    },
    {
      name: 'Entraide & Solidarité',
      nameAr: 'التعاون والتضامن',
      slug: 'entraide-solidarite',
      description: "S'entraider, partager des ressources, offrir de l'aide",
      color: '#be185d',
      order: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`✓ Catégorie créée : ${cat.name}`);
  }

  console.log('✅ Forum categories seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
