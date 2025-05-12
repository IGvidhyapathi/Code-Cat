import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { status } = body;

    // Extract ID from URL path
    const pathSegments = request.nextUrl.pathname.split("/");
    const applicationId = pathSegments[pathSegments.length - 1];

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    try {
      // First get the seller application to get the userId
      const seller = await prisma.seller.findUnique({
        where: { id: applicationId },
        select: { userId: true }
      });

      if (!seller) {
        return NextResponse.json(
          { error: "Seller application not found" },
          { status: 404 }
        );
      }

      // Then get the user's Clerk ID
      const user = await prisma.user.findUnique({
        where: { id: seller.userId },
        select: { clerkId: true }
      });

      if (!user || !user.clerkId) {
        return NextResponse.json(
          { error: "User not found or Clerk ID not available" },
          { status: 404 }
        );
      }

      // Update the user's public metadata in Clerk
      await clerkClient.users.updateUserMetadata(user.clerkId, {
        publicMetadata: {
          role: status === "approved" ? "seller" : "member",
        },
      });

      return NextResponse.json({
        success: true,
        message: "User role updated successfully",
        role: status === "approved" ? "seller" : "member",
      });
    } catch (clerkError) {
      console.error("Clerk API Error:", clerkError);
      return NextResponse.json(
        { error: "Failed to update user role in Clerk" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request Error:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}
