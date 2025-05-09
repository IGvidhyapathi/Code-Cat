import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { paymentId, projectStatus } = await request.json();

    // Validate project status
    const validStatuses = ['Ordered', 'Communication', 'DeliveryInProgress', 'Delivered'];
    if (!validStatuses.includes(projectStatus)) {
      return NextResponse.json(
        { error: 'Invalid project status' },
        { status: 400 }
      );
    }

    // Update the payment status in the database
    const result = await db.query(
      `UPDATE payments 
       SET "projectStatus" = $1 
       WHERE id = $2 
       RETURNING id, "projectStatus"`,
      [projectStatus, paymentId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 