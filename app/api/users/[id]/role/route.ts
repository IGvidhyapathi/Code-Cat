import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the current user is an admin
    const currentUser = await clerkClient.users.getUser(userId);
    if (currentUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // Extract the target user ID from the URL
    const targetUserId = req.nextUrl.pathname.split("/")[3];
    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the new role from the request body
    const body = await req.json();
    const { role } = body;

    if (!role || !['admin', 'seller', 'marketer', 'member'].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update the user's role
    await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
} 