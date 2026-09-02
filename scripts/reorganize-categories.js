import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

async function reorganize() {
  console.log('Starting categories reorganization...');
  
  try {
    // 1. Ensure the 5 required categories exist (or create them if missing)
    const cocktails = await prisma.menuCategory.upsert({
      where: { slug: 'cocktails' },
      update: { name_en: 'Signature Cocktails', name_fr: 'Cocktails Signatures', order: 1 },
      create: { slug: 'cocktails', name_en: 'Signature Cocktails', name_fr: 'Cocktails Signatures', order: 1, image: '/assets/background_2.jpeg', tag: 'Creativity' }
    });
    
    const mocktails = await prisma.menuCategory.upsert({
      where: { slug: 'mocktails' },
      update: { name_en: 'Mocktails', name_fr: 'Mocktails', order: 2 },
      create: { slug: 'mocktails', name_en: 'Mocktails', name_fr: 'Mocktails', order: 2, image: '/assets/background_2.jpeg', tag: 'Freshness' }
    });

    const wine = await prisma.menuCategory.upsert({
      where: { slug: 'wine' },
      update: { name_en: 'Wines', name_fr: 'Vins', order: 3 },
      create: { slug: 'wine', name_en: 'Wines', name_fr: 'Vins', order: 3, image: '/assets/background_3.jpeg', tag: 'Elegance' }
    });

    const beer = await prisma.menuCategory.upsert({
      where: { slug: 'beer' },
      update: { name_en: 'Beers', name_fr: 'Bières', order: 4 },
      create: { slug: 'beer', name_en: 'Beers', name_fr: 'Bières', order: 4, image: '/assets/background_5.jpeg', tag: 'Craft' }
    });

    const food = await prisma.menuCategory.upsert({
      where: { slug: 'food' },
      update: { name_en: 'Food', name_fr: 'Nourriture', order: 5 },
      create: { slug: 'food', name_en: 'Food', name_fr: 'Nourriture', order: 5, image: '/assets/background_4.jpeg', tag: 'Authentic' }
    });

    console.log('Set up and ordered the 5 default categories.');

    // 2. Re-map any menu items from 'pizza' category to 'food' category
    const pizzaCategory = await prisma.menuCategory.findUnique({
      where: { slug: 'pizza' }
    });

    if (pizzaCategory) {
      console.log('Found legacy pizza category. Re-mapping items to Food...');
      
      const updatedItems = await prisma.menuItem.updateMany({
        where: { categoryId: pizzaCategory.id },
        data: { categoryId: food.id }
      });
      
      console.log(`Re-mapped ${updatedItems.count} items from Pizza to Food.`);
      
      // 3. Delete the legacy pizza category
      await prisma.menuCategory.delete({
        where: { id: pizzaCategory.id }
      });
      console.log('Deleted legacy pizza category.');
    }

    // 4. Delete any other categories that are not the 5 main ones, to keep it clean
    const allCats = await prisma.menuCategory.findMany();
    const allowedSlugs = ['cocktails', 'mocktails', 'wine', 'beer', 'food'];
    
    for (const cat of allCats) {
      if (!allowedSlugs.includes(cat.slug)) {
        console.log(`Deleting unauthorized category: ${cat.slug}`);
        // First delete items or re-map them to food
        await prisma.menuItem.updateMany({
          where: { categoryId: cat.id },
          data: { categoryId: food.id }
        });
        await prisma.menuCategory.delete({
          where: { id: cat.id }
        });
      }
    }

    console.log('Reorganization completed successfully!');

  } catch (err) {
    console.error('Failed to reorganize categories:', err);
  } finally {
    await prisma.$disconnect();
  }
}

reorganize();
