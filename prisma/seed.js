import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── 1. CLEANUP ──
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.publicEvent.deleteMany();
  await prisma.user.deleteMany();

  // ── 2. ADMIN USER ──
  const admin = await prisma.user.create({
    data: {
      name: 'Mat (Admin)',
      email: 'info@magpiemagique.com',
      password: 'heybuddyboy', // Note: In production, this must be hashed!
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });
  console.log('Admin user created');

  // ── 3. MENU CATEGORIES ──
  const cocktails = await prisma.menuCategory.create({
    data: {
      slug: 'cocktails',
      name_fr: 'Cocktails Signatures',
      name_en: 'Signature Cocktails',
      image: '/assets/background_2.jpeg',
      tag: 'Creativity',
      order: 1
    }
  });

  const pizza = await prisma.menuCategory.create({
    data: {
      slug: 'pizza',
      name_fr: 'Pizzas Artisanales',
      name_en: 'Artisan Pizzas',
      image: '/assets/background_4.jpeg',
      tag: 'Authentic',
      order: 2
    }
  });

  // ── 4. MENU ITEMS (MOCK DATA) ──
  await prisma.menuItem.createMany({
    data: [
      {
        name_fr: 'Le Magpie Magique',
        name_en: 'The Magpie Magic',
        ingredients_fr: 'Gin, Litchi, Lime, Menthe fraîche',
        ingredients_en: 'Gin, Lychee, Lime, Fresh Mint',
        price: '16',
        categoryId: cocktails.id
      },
      {
        name_fr: 'Margherita Royale',
        name_en: 'Margherita Royal',
        ingredients_fr: 'Tomate San Marzano, Mozzarella di Bufala, Basilic',
        ingredients_en: 'San Marzano Tomato, Mozzarella di Bufala, Basil',
        price: '18',
        categoryId: pizza.id
      }
    ]
  });
  console.log('Menus seeded');

  // ── 5. PUBLIC EVENTS ──
  await prisma.publicEvent.createMany({
    data: [
      {
        date: new Date('2026-03-27T20:00:00Z'),
        title_fr: 'Jazz Live - Raf Jazz Trio',
        title_en: 'Live Jazz - Raf Jazz Trio',
        type: 'JAZZ',
        color: '#C9A84C'
      },
      {
        date: new Date('2026-03-25T20:00:00Z'),
        title_fr: 'Soirée Humour',
        title_en: 'Comedy Night',
        type: 'COMEDY',
        color: '#E74C3C'
      }
    ]
  });
  console.log('Events seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
