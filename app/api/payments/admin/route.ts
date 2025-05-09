import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// GET /api/payments/admin - Get all payments (admin only)
export async function GET(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse URL for any query parameters
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const searchQuery = url.searchParams.get('search');
    
    console.log('Admin fetching all payments with filters:', { projectId, searchQuery });
    
    // Use raw SQL query to fetch all payments
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
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramCounter = 1;
      
      // Start WHERE clause if we have filters
      if (projectId || searchQuery) {
        sqlQuery += ' AND';
      }
      
      // Add project filter if provided
      if (projectId) {
        sqlQuery += ` p."projectId" = $${paramCounter}`;
        queryParams.push(projectId);
        paramCounter++;
        
        // Add AND if we have more filters
        if (searchQuery) {
          sqlQuery += ' AND';
        }
      }
      
      // Add search filter if provided
      if (searchQuery) {
        sqlQuery += ` (
          proj.title ILIKE $${paramCounter} OR 
          p."razorpayPaymentId" ILIKE $${paramCounter} OR
          u."firstName" ILIKE $${paramCounter} OR
          u."lastName" ILIKE $${paramCounter} OR
          u."email" ILIKE $${paramCounter} OR
          u."phone" ILIKE $${paramCounter}
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
      
      console.log(`Admin found ${payments.length} payments`);
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