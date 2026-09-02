import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

const defaultCategories = [
  {
    slug: 'wine',
    name_fr: 'Vins d\'Exception',
    name_en: 'Fine Wines',
    image: '/assets/background_3.jpeg',
    tag: 'Elegance',
    order: 1
  },
  {
    slug: 'cocktails',
    name_fr: 'Cocktails Signatures',
    name_en: 'Signature Cocktails',
    image: '/assets/background_2.jpeg',
    tag: 'Creativity',
    order: 2
  },
  {
    slug: 'mocktails',
    name_fr: 'Mocktails',
    name_en: 'Mocktails',
    image: '/assets/background_2.jpeg',
    tag: 'Freshness',
    order: 3
  },
  {
    slug: 'beer',
    name_fr: 'Bières Artisanales',
    name_en: 'Craft Beers',
    image: '/assets/background_5.jpeg',
    tag: 'Craft',
    order: 4
  },
  {
    slug: 'food',
    name_fr: 'Petites Assiettes',
    name_en: 'Small Plates',
    image: '/assets/background_4.jpeg',
    tag: 'Authentic',
    order: 5
  }
];

async function seedCategories() {
  console.log('Seeding basic categories...');
  
  try {
    for (const cat of defaultCategories) {
      const result = await prisma.menuCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name_fr: cat.name_fr,
          name_en: cat.name_en,
          tag: cat.tag,
          order: cat.order,
          image: cat.image
        },
        create: {
          slug: cat.slug,
          name_fr: cat.name_fr,
          name_en: cat.name_en,
          tag: cat.tag,
          order: cat.order,
          image: cat.image
        }
      });
      console.log(`Upserted category: ${result.name_en} (slug: ${result.slug})`);
    }
    console.log('Successfully seeded default categories!');
  } catch (err) {
    console.error('Failed to seed categories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
