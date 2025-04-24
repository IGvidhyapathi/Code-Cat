import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  // Get the webhook signature from the headers
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    );
  }

  // Get the headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with the secret
  const webhook = new Webhook(WEBHOOK_SECRET);

  let event: WebhookEvent;

  // Verify the payload with the headers
  try {
    event = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Get the event type
  const eventType = event.type;
  const { id } = event.data;

  console.log(`Webhook received: ${eventType}`);

  // Handle user creation
  if (eventType === 'user.created') {
    try {
      // Extract user data from the event
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;

      // Get the primary email
      const primaryEmail = email_addresses && email_addresses.length > 0 
        ? email_addresses[0].email_address 
        : null;

      // Create a new user in the database
      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkId as string,
          firstName: first_name as string || null,
          lastName: last_name as string || null,
          email: primaryEmail,
          imageUrl: image_url as string || null,
        },
      });

      console.log('User created successfully:', newUser);

      return NextResponse.json(
        { message: 'User created' },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Error creating user' },
        { status: 500 }
      );
    }
  }

  // Handle user update
  if (eventType === 'user.updated') {
    try {
      // Extract user data from the event
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;

      // Get the primary email
      const primaryEmail = email_addresses && email_addresses.length > 0 
        ? email_addresses[0].email_address 
        : null;

      // Update the user in the database
      const updatedUser = await prisma.user.update({
        where: { clerkId: clerkId as string },
        data: {
          firstName: first_name as string || undefined,
          lastName: last_name as string || undefined,
          email: primaryEmail || undefined,
          imageUrl: image_url as string || undefined,
        },
      });

      console.log('User updated successfully:', updatedUser);

      return NextResponse.json(
        { message: 'User updated' },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // If user doesn't exist, create it
      if (error.code === 'P2025') {
        try {
          // Extract user data from the event
          const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;

          // Get the primary email
          const primaryEmail = email_addresses && email_addresses.length > 0 
            ? email_addresses[0].email_address 
            : null;

          // Create a new user in the database
          const newUser = await prisma.user.create({
            data: {
              clerkId: clerkId as string,
              firstName: first_name as string || null,
              lastName: last_name as string || null,
              email: primaryEmail,
              imageUrl: image_url as string || null,
            },
          });

          console.log('User created during update:', newUser);

          return NextResponse.json(
            { message: 'User created during update' },
            { status: 201 }
          );
        } catch (createError) {
          console.error('Error creating user during update:', createError);
          return NextResponse.json(
            { error: 'Error creating user during update' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Error updating user' },
        { status: 500 }
      );
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    try {
      // Don't actually delete the user record to maintain referential integrity
      // Instead, update a "deletedAt" field if you have one, or you could add additional logic
      
      console.log('User deletion event received for:', id);
      
      // Optional: If you want to delete the user's data or mark them as deleted
      // await prisma.user.update({
      //   where: { clerkId: id as string },
      //   data: { 
      //     // If you have a deletedAt field:
      //     // deletedAt: new Date(),
      //     // Or you could set an "isDeleted" flag
      //   }
      // });

      return NextResponse.json(
        { message: 'User deletion recorded' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error handling user deletion:', error);
      return NextResponse.json(
        { error: 'Error handling user deletion' },
        { status: 500 }
      );
    }
  }

  // Default response for other event types
  return NextResponse.json(
    { message: `Webhook received: ${eventType}` },
    { status: 200 }
  );
} 