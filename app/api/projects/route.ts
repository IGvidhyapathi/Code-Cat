import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        keyFeatures: true,
        techStack: true,
        youtubeUrl: true,
        demoUrl: true,
        category: true,
        price: true,
        userId: true,
        createdAt: true,
      }
    });

    // Add cache headers
    const response = NextResponse.json(projects);
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
    
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'keyFeatures', 'techStack', 'youtubeUrl', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create project with essential fields and optional fields
    const newProject = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        keyFeatures: Array.isArray(body.keyFeatures) ? body.keyFeatures : [],
        techStack: Array.isArray(body.techStack) ? body.techStack : [],
        youtubeUrl: body.youtubeUrl,
        demoUrl: body.demoUrl || null,
        installationGuide: body.installationGuide || null,
        contactEmail: body.contactEmail || null,
        contactTwitter: body.contactTwitter || null,
        contactGithub: body.contactGithub || null,
        category: body.category,
        price: body.price ? parseFloat(String(body.price)) : null,
        userId
      }
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}
