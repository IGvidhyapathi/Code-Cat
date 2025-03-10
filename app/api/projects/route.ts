import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const allProjects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ data: allProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const newProject = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        keyFeatures: body.keyFeatures,
        techStack: body.techStack,
        youtubeUrl: body.youtubeUrl,
        demoUrl: body.demoUrl || null,
        installationGuide: body.installationGuide || null,
        contactEmail: body.contactEmail || null,
        contactTwitter: body.contactTwitter || null,
        contactGithub: body.contactGithub || null,
        category: body.category,
        price: body.price,
        userId: userId,
      }
    });

    return NextResponse.json({ data: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
