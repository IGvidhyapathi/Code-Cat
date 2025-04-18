import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export const revalidate = 30; // Revalidate every 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '12');
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      const count = await prisma.project.count();
      return NextResponse.json({ count });
    }
    
    const projects = await prisma.project.findMany({
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1
      }),
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

    const hasMore = projects.length > limit;
    const items = hasMore ? projects.slice(0, -1) : projects;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Add cache headers
    const response = NextResponse.json({
      items,
      nextCursor,
      hasMore
    });
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
    } else {
      // Update user profile if it exists
      try {
        dbUser = await prisma.user.update({
          where: { clerkId: userId },
          data: {
            firstName: user?.firstName || dbUser.firstName,
            lastName: user?.lastName || dbUser.lastName,
            imageUrl: user?.imageUrl || dbUser.imageUrl,
            email: user?.emailAddresses?.[0]?.emailAddress || dbUser.email,
          }
        });
        console.log('Updated user profile:', dbUser);
      } catch (updateError) {
        console.error('Error updating user profile:', updateError);
        // Continue with project creation even if profile update fails
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
          projectType: body.projectType || 'readymade',
          includesDocumentation: body.includesDocumentation || false,
          includesSourceCode: body.includesSourceCode || false,
          includesSupport: body.includesSupport || false,
          supportDuration: body.supportDuration || '1',
          lastUpdated: new Date(body.lastUpdated),
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
