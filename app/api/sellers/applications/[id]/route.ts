import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface SellerStatus {
  id: string;
  status: string;
  userId: string;
}

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  verifiedBy: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    // First check if the seller exists
    const sellers = await prisma.$queryRaw<SellerStatus[]>`
      SELECT id, status, "userId"
      FROM "sellers"
      WHERE id = ${params.id}
    `;

    if (!sellers || sellers.length === 0) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      );
    }

    const seller = sellers[0];

    // Update the seller status using raw SQL
    await prisma.$executeRaw`
      UPDATE "sellers"
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

    try {
      // Get the user from the database to get their Clerk ID
      const dbUser = await prisma.user.findUnique({
        where: { id: seller.userId },
        select: { clerkId: true }
      });

      if (dbUser) {
        // Update the user's public metadata in Clerk based on status
        await clerkClient.users.updateUserMetadata(dbUser.clerkId, {
          publicMetadata: { role: status === 'approved' ? "seller" : "member" }
        });

        // Also update the role in our database
        await prisma.user.update({
          where: { id: seller.userId },
          data: { roles: status === 'approved' ? "Seller" : "Member" }
        });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      // Continue with the response even if role update fails
    }

    // Fetch the updated seller
    const updatedSellers = await prisma.$queryRaw<Seller[]>`
      SELECT * FROM "sellers"
      WHERE id = ${params.id}
    `;

    if (!updatedSellers || updatedSellers.length === 0) {
      throw new Error("Failed to fetch updated seller");
    }

    return NextResponse.json(updatedSellers[0]);
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
} 