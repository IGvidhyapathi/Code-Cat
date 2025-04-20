import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export const revalidate = 30; // Revalidate every 30 seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const countOnly = searchParams.get('countOnly') === 'true';
    
    // Get search and filter parameters
    const searchQuery = searchParams.get('search');
    const category = searchParams.get('category');
    const priceRange = searchParams.get('priceRange');
    const projectType = searchParams.get('projectType');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build where clause based on search and filter parameters
    const whereClause: any = {};
    
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { techStack: { hasSome: [searchQuery] } } // Search in techStack array
      ];
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (projectType && projectType !== 'all') {
      whereClause.projectType = projectType;
    }

    if (priceRange && priceRange !== 'all') {
      if (priceRange === 'free') {
        whereClause.price = null;
      } else if (priceRange === '100-600') {
        whereClause.price = { gte: 100, lte: 600 };
      } else if (priceRange === '600-1300') {
        whereClause.price = { gt: 600, lte: 1300 };
      } else if (priceRange === '1300-2000') {
        whereClause.price = { gt: 1300, lte: 2000 };
      } else if (priceRange === '2000-3000') {
        whereClause.price = { gt: 2000, lte: 3000 };
      } else if (priceRange === '3000+') {
        whereClause.price = { gt: 3000 };
      }
    }

    // If count only, return just the total count
    if (countOnly) {
      const count = await prisma.project.count({
        where: whereClause
      });
      return Response.json({ count }, {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
        }
      });
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // default is newest
    
    if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortBy === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-high') {
      orderBy = { price: 'desc' };
    }

    // For pagination, we fetch one more than the limit to know if there are more items
    const projects = await prisma.project.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1, // Skip the cursor
          }
        : {}),
      orderBy: orderBy,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Check if there are more projects
    const hasMore = projects.length > limit;
    const items = hasMore ? projects.slice(0, limit) : projects;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Return paginated results
    return Response.json(
      { 
        items, 
        nextCursor, 
        hasMore 
      },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
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
