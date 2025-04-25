import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().min(1, "Phone number is required")
});

export async function GET(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Find the user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        phone: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasPhone: !!dbUser.phone,
      phone: dbUser.phone
    });
  } catch (error) {
    console.error('Error checking phone status:', error);
    return NextResponse.json(
      { error: 'Failed to check phone status' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = phoneSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { phone } = validationResult.data;
    console.log(`Attempting to save phone number '${phone}' for user ${userId}`);

    // Find the user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      console.error(`Database user not found for clerk ID: ${userId}`);
      return NextResponse.json({ error: 'Database user not found' }, { status: 404 });
    }

    console.log(`Found user in database: ${dbUser.id}`);

    // Direct database update using Prisma's raw SQL capabilities
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "phone" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING "id", "phone"`,
      phone,
      dbUser.id
    );

    console.log('SQL update result:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'Phone number updated successfully',
      user: {
        id: dbUser.id,
        phone: phone
      }
    });
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number', details: String(error) },
      { status: 500 }
    );
  }
} 