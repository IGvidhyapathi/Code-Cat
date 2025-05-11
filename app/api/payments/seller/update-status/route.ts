import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { paymentId, projectStatus } = body;

    if (!paymentId || !projectStatus) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // First, let's check if the user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify that the payment belongs to this seller
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        OR: [
          {
            project: {
              userId: dbUser.id
            }
          },
          {
            project_taken: dbUser.id
          }
        ]
      }
    });

    if (!payment) {
      return new NextResponse("Payment not found or unauthorized", { status: 404 });
    }

    // Update the payment status
    const updatedPayment = await prisma.payment.update({
      where: {
        id: paymentId
      },
      data: {
        projectStatus
      }
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("[PAYMENTS_SELLER_UPDATE_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 