import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        keyFeatures: true,
        techStack: true,
        youtubeUrl: true,
        demoUrl: true,
        installationGuide: true,
        contactEmail: true,
        contactTwitter: true,
        contactGithub: true,
        category: true,
        price: true,
        projectType: true,
        includesDocumentation: true,
        includesSourceCode: true,
        includesSupport: true,
        supportDuration: true,
        lastUpdated: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const response = NextResponse.json(project);
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    
    return response;
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
