import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get project ID from URL
    const projectId = request.url.split('/').slice(-2)[0];
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has paid for this project
    const payment = await prisma.payment.findFirst({
      where: {
        projectId: projectId,
        userId: dbUser.id,
        status: 'success'
      },
      select: {
        id: true,
        amount: true,
        razorpayPaymentId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      hasPaid: !!payment,
      payment: payment || null
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
} 