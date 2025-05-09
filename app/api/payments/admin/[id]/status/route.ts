import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Payment } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectStatus } = await req.json();
    const validStatuses = ['Ordered', 'Communication', 'DeliveryInProgress', 'Delivered'];

    if (!validStatuses.includes(projectStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const payment = await prisma.$queryRaw<Payment[]>`
      UPDATE payments 
      SET "projectStatus" = ${projectStatus}::text::"ProjectStatus"
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json(payment[0]);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 