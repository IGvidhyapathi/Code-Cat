import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET /api/payments/user - Get user's payments
export async function GET(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse URL for any query parameters
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('search');
    
    console.log('User fetching payments with filters:', { userId, searchQuery });
    
    // Use raw SQL query to fetch user's payments
    try {
      let sqlQuery = `
        SELECT 
          p.id, p.amount, p.currency, p.status, p."projectStatus", p."razorpayPaymentId", 
          p."projectId", p."createdAt", p."userId", p."project_taken",
          proj.id as "project_id", proj.title as "project_title", 
          proj.category as "project_category",
          u."firstName" as "user_firstName", u."lastName" as "user_lastName",
          u."email" as "user_email", u."imageUrl" as "user_imageUrl",
          u."phone" as "user_phone"
        FROM payments p
        JOIN projects proj ON p."projectId" = proj.id
        JOIN "User" u ON p."userId" = u.id
        WHERE p."userId" = $1
      `;
      
      const queryParams: any[] = [userId];
      
      // Add search filter if provided
      if (searchQuery) {
        sqlQuery += ` AND (
          proj.title ILIKE $2 OR 
          p."razorpayPaymentId" ILIKE $2
        )`;
        queryParams.push(`%${searchQuery}%`);
      }
      
      // Add order by
      sqlQuery += ` ORDER BY p."createdAt" DESC`;
      
      console.log('Executing SQL query:', sqlQuery);
      console.log('With parameters:', queryParams);
      
      const results: any[] = await prisma.$queryRawUnsafe(sqlQuery, ...queryParams);
      
      // Format results to match expected structure
      const payments = results.map((row: any) => ({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        projectStatus: row.projectStatus || 'Ordered',
        project_taken: row.project_taken || null,
        razorpayPaymentId: row.razorpayPaymentId,
        projectId: row.projectId,
        userId: row.userId,
        createdAt: row.createdAt,
        project: {
          id: row.project_id,
          title: row.project_title,
          category: row.project_category
        },
        user: {
          firstName: row.user_firstName,
          lastName: row.user_lastName,
          email: row.user_email,
          imageUrl: row.user_imageUrl,
          phone: row.user_phone
        }
      }));
      
      console.log(`User found ${payments.length} payments`);
      return NextResponse.json(payments);
    } catch (dbError) {
      console.error('Database error fetching payments:', dbError);
      return NextResponse.json(
        { error: 'Database error fetching payments', details: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: String(error) },
      { status: 500 }
    );
  }
} 