import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { paymentId, projectStatus, projectTaken } = await request.json();

    // First, check if the project_taken column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' 
      AND column_name = 'project_taken';
    `;
    
    const columnExists = await db.query(checkColumnQuery);
    
    // If column doesn't exist, create it
    if (columnExists.rows.length === 0) {
      const addColumnQuery = `
        ALTER TABLE payments 
        ADD COLUMN project_taken VARCHAR(255);
      `;
      await db.query(addColumnQuery);
    }

    // Validate project status if provided
    if (projectStatus) {
      const validStatuses = ['Ordered', 'Communication', 'DeliveryInProgress', 'Delivered'];
      if (!validStatuses.includes(projectStatus)) {
        return NextResponse.json(
          { error: 'Invalid project status' },
          { status: 400 }
        );
      }
    }

    // Validate project taken if provided
    if (projectTaken) {
      const validPersons = ['Vidhyapathi', 'Dharun', 'Bharathkumar', 'Manoj'];
      if (!validPersons.includes(projectTaken)) {
        return NextResponse.json(
          { error: 'Invalid project taken' },
          { status: 400 }
        );
      }
    }

    // Build the update query based on what fields are provided
    let updateQuery = 'UPDATE payments SET ';
    const queryParams = [];
    let paramCount = 1;

    if (projectStatus) {
      updateQuery += `"projectStatus" = $${paramCount}, `;
      queryParams.push(projectStatus);
      paramCount++;
    }

    if (projectTaken) {
      updateQuery += `"project_taken" = $${paramCount}, `;
      queryParams.push(projectTaken);
      paramCount++;
    }

    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);

    // Add WHERE clause and RETURNING
    updateQuery += ` WHERE id = $${paramCount} RETURNING id, "projectStatus", "project_taken"`;
    queryParams.push(paymentId);

    // Update the payment in the database
    const result = await db.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
} 