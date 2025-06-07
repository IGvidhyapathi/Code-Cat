import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

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

export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.youtubeUrl || !body.category) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Check if project exists and verify ownership
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify project ownership
    if (existingProject.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this project' },
        { status: 403 }
      );
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        keyFeatures: body.keyFeatures,
        techStack: body.techStack,
        youtubeUrl: body.youtubeUrl,
        demoUrl: body.demoUrl,
        installationGuide: body.installationGuide,
        contactEmail: body.contactEmail,
        contactTwitter: body.contactTwitter,
        contactGithub: body.contactGithub,
        category: body.category,
        price: body.price,
        projectType: body.projectType,
        includesDocumentation: body.includesDocumentation,
        includesSourceCode: body.includesSourceCode,
        includesSupport: body.includesSupport,
        supportDuration: body.supportDuration,
        lastUpdated: body.lastUpdated || new Date().toISOString().split('T')[0],
      }
    });

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if project exists and get its payment information
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        payments: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify project ownership
    if (project.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this project' },
        { status: 403 }
      );
    }

    // If there are associated payments, we should handle them appropriately
    if (project.payments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete project with existing payments' },
        { status: 400 }
      );
    }

    // Delete the project
    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
