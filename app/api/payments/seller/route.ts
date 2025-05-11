import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching payments for seller with userId:", userId);

    // First, let's check if the user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      console.log("User not found in database for clerkId:", userId);
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("Found user in database:", dbUser.id);

    // Get the seller's payments - both for projects they created and projects assigned to them
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          // Projects created by the seller
          {
            project: {
              userId: dbUser.id
            }
          },
          // Projects assigned to the seller
          {
            project_taken: dbUser.id
          }
        ]
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        projectStatus: true,
        project_taken: true,
        razorpayPaymentId: true,
        projectId: true,
        userId: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("Found payments:", payments.length);
    if (payments.length === 0) {
      // Let's check if there are any projects at all
      const projects = await prisma.project.findMany({
        where: {
          userId: dbUser.id
        }
      });
      console.log("User's projects:", projects.length);
      
      // Also check if there are any payments assigned to this user
      const assignedPayments = await prisma.payment.findMany({
        where: {
          project_taken: dbUser.id
        }
      });
      console.log("Payments assigned to user:", assignedPayments.length);
    }

    // Ensure projectStatus is set to a default value if missing
    const paymentsWithStatus = payments.map(payment => ({
      ...payment,
      projectStatus: payment.projectStatus || 'Ordered'
    }));

    return NextResponse.json(paymentsWithStatus);
  } catch (error) {
    console.error("[PAYMENTS_SELLER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 