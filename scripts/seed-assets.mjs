// Seed local /assets/ images into the Prisma Photo database
// Run with: node scripts/seed-assets.mjs
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { readdirSync } from 'fs';
import { join } from 'path';

// Use DIRECT_URL (port 5432) to bypass transaction pooler — same approach as prisma.config.ts
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ASSETS_DIR = join(process.cwd(), 'public', 'assets');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

async function main() {
  const files = readdirSync(ASSETS_DIR).filter(f => {
    const ext = f.substring(f.lastIndexOf('.')).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  console.log(`Found ${files.length} image files in /assets`);
  let added = 0;
  let skipped = 0;

  for (const filename of files) {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const url = `/assets/${filename}`;

    const existing = await prisma.photo.findFirst({
      where: { OR: [{ name: nameWithoutExt }, { url }] }
    });

    if (existing) {
      console.log(`  SKIP  ${filename}`);
      skipped++;
      continue;
    }

    await prisma.photo.create({
      data: { url, name: nameWithoutExt, source: 'local' }
    });
    console.log(`  ADD   ${filename}`);
    added++;
  }

  console.log(`\nDone! Added ${added}, skipped ${skipped}.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
