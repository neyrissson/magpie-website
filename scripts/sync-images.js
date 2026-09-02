import 'dotenv/config';
import prisma from '../src/lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

async function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function sync() {
  console.log('--- Starting Image Sync ---');
  const files = await getAllFiles(publicDir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.JPG'];
  
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });

  console.log(`Found ${imageFiles.length} images in public directory.`);

  for (const file of imageFiles) {
    const relativeWebPath = '/' + path.relative(publicDir, file);
    const fileName = path.basename(file, path.extname(file));
    
    // Clean up filename (e.g. "Copy of DSC09196" -> "DSC09196")
    const cleanName = fileName.replace(/^Copy of /, '').trim();

    try {
      await prisma.photo.upsert({
        where: { url: relativeWebPath },
        update: {},
        create: {
          url: relativeWebPath,
          name: cleanName,
          source: 'local'
        }
      });
      console.log(`Synced: ${relativeWebPath} (${cleanName})`);
    } catch (err) {
      console.error(`Error syncing ${relativeWebPath}:`, err.message);
    }
  }

  console.log('--- Sync Complete ---');
}

sync()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
