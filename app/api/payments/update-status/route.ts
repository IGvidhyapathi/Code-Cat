import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { paymentId, status, projectStatus, project_taken } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Validate payment status if provided
    if (status && !['pending', 'processing', 'settled'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid payment status. Must be one of: pending, processing, settled' 
      }, { status: 400 });
    }

    // Update payment in database
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status || undefined,
        projectStatus: projectStatus || undefined,
        project_taken: project_taken || undefined
      },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        },
        promoCode: {
          include: {
            marketer: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment', details: String(error) },
      { status: 500 }
    );
  }
} 