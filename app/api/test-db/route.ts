import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Test database operations
    const results = {
      userModelInfo: await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User'
      `,
      
      // Get the Prisma type definition for User (this is the client-side model)
      prismaUserFields: Object.keys(prisma.user.fields),
      
      // Check direct SQL update
      testSql: await prisma.$executeRaw`
        SELECT 'SQL is working correctly' as test_result
      `
    };

    return NextResponse.json({
      message: 'Database connection test successful',
      results,
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Failed to test database connection', details: String(error) },
      { status: 500 }
    );
  }
} 