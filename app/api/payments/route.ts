import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import crypto from 'crypto';

// Schema for payment validation
const paymentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpayOrderId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  status: z.enum(["success", "failed", "pending"]).default("success"),
  metadata: z.record(z.any()).optional(),
});

// POST /api/payments - Create a new payment
export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.error('Unauthorized: No user ID found');
      return NextResponse.json({ error: 'Authentication required', message: 'You must be signed in to make payments' }, { status: 401 });
    }

    // Get current user
    const user = await currentUser();
    if (!user) {
      console.error('Unauthorized: No user found for ID', userId);
      return NextResponse.json({ error: 'User not found', message: 'Your user account could not be found' }, { status: 404 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      console.error('Database user not found for Clerk ID:', userId);
      // User should have been created by webhook already, but if not, redirect to refresh page
      return NextResponse.json({ 
        error: 'Database user not found', 
        message: 'Please refresh the page and try again. Your account is being set up.' 
      }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    console.log('Payment data received:', body);
    
    // Validate payment data
    const validationResult = paymentSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.format());
      return NextResponse.json(
        { error: 'Invalid payment data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const paymentData = validationResult.data;

    // Verify the project exists
    const project = await prisma.project.findUnique({
      where: { id: paymentData.projectId }
    });

    if (!project) {
      console.error('Project not found with ID:', paymentData.projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('Creating payment record with data:', {
      amount: paymentData.amount,
      status: paymentData.status,
      razorpayPaymentId: paymentData.razorpayPaymentId,
      projectId: paymentData.projectId,
      userId: dbUser.id
    });

    // Create the payment record - try direct table name approach
    try {
      const payment = await prisma.$queryRaw`
        INSERT INTO payments (
          id, amount, currency, status, "razorpayPaymentId", 
          "projectId", "userId", "createdAt", "updatedAt", metadata
        ) VALUES (
          ${crypto.randomUUID()}, ${paymentData.amount}, 'INR', ${paymentData.status}, 
          ${paymentData.razorpayPaymentId}, ${paymentData.projectId}, 
          ${dbUser.id}, NOW(), NOW(), ${JSON.stringify(paymentData.metadata || {})}::jsonb
        )
        RETURNING id, amount, status, "razorpayPaymentId"
      `;
      
      console.log('Payment created successfully:', payment);
      
      return NextResponse.json(payment, { status: 201 });
    } catch (dbError) {
      console.error('Database error creating payment:', dbError);
      return NextResponse.json(
        { error: 'Database error creating payment', details: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/payments - Get payments for the current user
export async function GET(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.error('Unauthorized: No user ID found in GET request');
      return NextResponse.json({ error: 'Authentication required', message: 'You must be signed in to view payments' }, { status: 401 });
    }

    // Get current user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      console.error('Database user not found for Clerk ID:', userId);
      // User should have been created by webhook already, but if not, redirect to refresh page
      return NextResponse.json({ 
        error: 'Database user not found', 
        message: 'Please refresh the page and try again. Your account is being set up.' 
      }, { status: 404 });
    }

    // Parse URL for any query parameters
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const searchQuery = url.searchParams.get('search');
    
    console.log('Fetching payments with filters:', { userId: dbUser.id, projectId, searchQuery });
    
    // Use raw SQL query to fetch payments
    try {
      let sqlQuery = `
        SELECT 
          p.id, p.amount, p.currency, p.status, p."projectStatus", p."razorpayPaymentId", 
          p."projectId", p."createdAt", p."userId", p."project_taken",
          proj.id as "project_id", proj.title as "project_title", 
          proj.category as "project_category",
          u."firstName" as "user_firstName", u."lastName" as "user_lastName"
        FROM payments p
        JOIN projects proj ON p."projectId" = proj.id
        JOIN "User" u ON p."userId" = u.id
        WHERE p."userId" = $1
      `;
      
      const queryParams: any[] = [dbUser.id];
      
      // Add project filter if provided
      if (projectId) {
        sqlQuery += ` AND p."projectId" = $2`;
        queryParams.push(projectId);
      }
      
      // Add search filter if provided
      if (searchQuery) {
        const paramIndex = queryParams.length + 1;
        sqlQuery += ` AND (
          proj.title ILIKE $${paramIndex} OR 
          p."razorpayPaymentId" ILIKE $${paramIndex}
        )`;
        queryParams.push(`%${searchQuery}%`);
      }
      
      // Add order by
      sqlQuery += ` ORDER BY p."createdAt" DESC`;
      
      const results: any[] = await prisma.$queryRawUnsafe(sqlQuery, ...queryParams);
      
      // Format results to match expected structure
      const payments = results.map((row: any) => ({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        projectStatus: row.projectStatus || 'Ordered',
        razorpayPaymentId: row.razorpayPaymentId,
        projectId: row.projectId,
        userId: row.userId,
        createdAt: row.createdAt,
        project_taken: row.project_taken,
        project: {
          id: row.project_id,
          title: row.project_title,
          category: row.project_category,
          user: {
            firstName: row.user_firstName,
            lastName: row.user_lastName
          }
        }
      }));
      
      console.log(`Found ${payments.length} payments for user`);
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