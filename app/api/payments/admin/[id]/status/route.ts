import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { projectStatus } = await req.json();
    const { id } = params;

    // Validate project status
    const validStatuses = ['Ordered', 'Communication', 'DeliveryInProgress', 'Delivered'];
    if (!validStatuses.includes(projectStatus)) {
      return new Response(
        JSON.stringify({ error: 'Invalid project status' }),
        { status: 400 }
      );
    }

    // Update the payment status
    const result = await db.query(
      `UPDATE payments 
       SET "projectStatus" = $1 
       WHERE id = $2 
       RETURNING id, "projectStatus"`,
      [projectStatus, id]
    );

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify(result.rows[0]),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating payment status:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update payment status' }),
      { status: 500 }
    );
  }
} 