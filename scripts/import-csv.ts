import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importUsers() {
  try {
    const csvContent = fs.readFileSync(path.join(process.cwd(), 'User.csv'), 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Found ${records.length} users to import`);

    for (const record of records) {
      try {
        // First try to find the user by clerkId
        const existingUser = await prisma.user.findUnique({
          where: { clerkId: record.clerkId }
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              firstName: record.firstName || null,
              lastName: record.lastName || null,
              imageUrl: record.imageUrl || null,
              email: record.email || null,
              phone: record.phone || null,
              updatedAt: new Date(record.updatedAt)
            }
          });
        } else {
          // Create new user
          await prisma.user.create({
            data: {
              id: record.id,
              clerkId: record.clerkId,
              firstName: record.firstName || null,
              lastName: record.lastName || null,
              imageUrl: record.imageUrl || null,
              email: record.email || null,
              phone: record.phone || null,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt)
            }
          });
        }
      } catch (error) {
        console.error(`Error processing user ${record.clerkId}:`, error);
        // Continue with next user
        continue;
      }
    }

    console.log('Users imported successfully');
  } catch (error) {
    console.error('Error importing users:', error);
    throw error;
  }
}

async function importProjects() {
  try {
    const csvContent = fs.readFileSync(path.join(process.cwd(), 'projects.csv'), 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Found ${records.length} projects to import`);

    for (const record of records) {
      try {
        // Convert comma-separated strings to arrays and trim whitespace
        const keyFeatures = record.keyFeatures
          ? record.keyFeatures.split(',').map((item: string) => item.trim())
          : [];
        const techStack = record.techStack
          ? record.techStack.split(',').map((item: string) => item.trim())
          : [];
        await prisma.project.upsert({
          where: { id: record.id },
          update: {
            title: record.title,
            description: record.description,
            keyFeatures,
            techStack,
            youtubeUrl: record.youtubeUrl,
            demoUrl: record.demoUrl || null,
            installationGuide: record.installationGuide || null,
            contactEmail: record.contactEmail || null,
            contactTwitter: record.contactTwitter || null,
            contactGithub: record.contactGithub || null,
            category: record.category,
            price: record.price ? parseFloat(record.price) : null,
            projectType: record.projectType || 'readymade',
            includesDocumentation: record.includesDocumentation === 'true',
            includesSourceCode: record.includesSourceCode === 'true',
            includesSupport: record.includesSupport === 'true',
            supportDuration: record.supportDuration || '1',
            lastUpdated: new Date(record.lastUpdated),
            userId: record.userId,
            updatedAt: new Date(record.updatedAt)
          },
          create: {
            id: record.id,
            title: record.title,
            description: record.description,
            keyFeatures,
            techStack,
            youtubeUrl: record.youtubeUrl,
            demoUrl: record.demoUrl || null,
            installationGuide: record.installationGuide || null,
            contactEmail: record.contactEmail || null,
            contactTwitter: record.contactTwitter || null,
            contactGithub: record.contactGithub || null,
            category: record.category,
            price: record.price ? parseFloat(record.price) : null,
            projectType: record.projectType || 'readymade',
            includesDocumentation: record.includesDocumentation === 'true',
            includesSourceCode: record.includesSourceCode === 'true',
            includesSupport: record.includesSupport === 'true',
            supportDuration: record.supportDuration || '1',
            lastUpdated: new Date(record.lastUpdated),
            userId: record.userId,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }
        });
      } catch (error) {
        console.error(`Error processing project ${record.id}:`, error);
        // Continue with next project
        continue;
      }
    }

    console.log('Projects imported successfully');
  } catch (error) {
    console.error('Error importing projects:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting data import...');
    await importUsers();
    await importProjects();
    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error during data import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 