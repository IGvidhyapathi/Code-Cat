import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Extract ID from URL
    const id = req.url.split("/").slice(-2)[0];

    // Get marketer details with email
    const marketer = await prisma.marketer.findUnique({
      where: { id },
      select: { email: true }
    });

    if (!marketer) {
      return NextResponse.json({ error: "Marketer not found" }, { status: 404 });
    }

    // Update marketer status
    await prisma.marketer.update({
      where: { id },
      data: {
        status: 'rejected',
        updatedAt: new Date()
      }
    });

    // Find the user in Clerk by email and update their role
    try {
      const users = await clerkClient.users.getUserList({
        emailAddress: [marketer.email]
      });
      
      if (users.length > 0) {
        const user = users[0];
        // Remove the role completely from publicMetadata
        const { role, ...restMetadata } = user.publicMetadata;
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: restMetadata
        });
      }
    } catch (clerkError) {
      console.error("Failed to update user role in Clerk:", clerkError);
      // Don't fail the request if Clerk update fails
    }

    return NextResponse.json({ message: "Marketer rejected successfully" });
  } catch (error) {
    console.error("Error rejecting marketer:", error);
    return NextResponse.json(
      { error: "Failed to reject marketer" },
      { status: 500 }
    );
  }
} 