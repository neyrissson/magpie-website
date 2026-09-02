import 'dotenv/config';
import prisma from '../src/lib/prisma.js';

async function addNeyrisson() {
  console.log('Adding neyrisson user...');
  try {
    const user = await prisma.user.upsert({
      where: { email: 'neyrisson@magpiemagique.com' },
      update: {
        role: 'ADMIN',
        status: 'ACTIVE',
        password: 'heybuddyboy'
      },
      create: {
        name: 'neyrisson',
        email: 'neyrisson@magpiemagique.com',
        password: 'heybuddyboy',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('User created/updated successfully:', user);
  } catch (err) {
    console.error('Failed to create user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addNeyrisson();
