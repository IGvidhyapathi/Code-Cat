import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
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

    // Add cache headers
    const response = NextResponse.json(projects);
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=59');
    
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Received project data:', body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'keyFeatures', 'techStack', 'youtubeUrl', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // First, ensure the user exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        email: true
      }
    });

    if (!dbUser) {
      try {
        // Create user if they don't exist
        dbUser = await prisma.user.create({
          data: {
            clerkId: userId,
            firstName: user?.firstName || null,
            lastName: user?.lastName || null,
            imageUrl: user?.imageUrl || null,
            email: user?.emailAddresses?.[0]?.emailAddress || null,
          }
        });
        console.log('Created new user:', dbUser);
      } catch (userError) {
        console.error('Error creating user:', userError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

    // Create project with essential fields and optional fields
    try {
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
          userId: dbUser.id
        },
        include: {
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
      console.log('Created new project:', newProject);
      return NextResponse.json(newProject);
    } catch (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
