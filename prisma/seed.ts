import { prisma } from '../lib/prisma'; // Import your Prisma client
import fs from 'fs';

async function main() {
  const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

  for (const project of jsonData) {
    await prisma.project.create({
      data: {
        ...project,
        keyFeatures: project.keyFeatures.map((item: string) => item.replace(/✅/g, '').trim()), // Removing checkmarks
      }
    });
  }

  console.log('✅ Data imported successfully!');
}

main().catch((error) => {
  console.error('❌ Error importing data:', error);
  process.exit(1);
});
