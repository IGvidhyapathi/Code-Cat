import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface SellerStatus {
  id: string;
  status: string;
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
    const { verifiedBy } = body;

    if (!verifiedBy) {
      return NextResponse.json(
        { error: "Verifier name is required" },
        { status: 400 }
      );
    }

    const validVerifiers = ["Vidhyapathi", "Dharun", "Bharathkumar", "Manoj"];
    if (!validVerifiers.includes(verifiedBy)) {
      return NextResponse.json(
        { error: "Invalid verifier" },
        { status: 400 }
      );
    }

    // First check if the seller exists and is approved
    const sellers = await prisma.$queryRaw<SellerStatus[]>`
      SELECT id, status
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
    if (seller.status !== 'approved') {
      return NextResponse.json(
        { error: "Can only verify approved sellers" },
        { status: 400 }
      );
    }

    // Update the seller with verification using raw SQL
    await prisma.$executeRaw`
      UPDATE "sellers"
      SET "verifiedBy" = ${verifiedBy}, "updatedAt" = NOW()
      WHERE id = ${params.id}
    `;

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
    console.error("Error verifying application:", error);
    return NextResponse.json(
      { error: "Failed to verify application" },
      { status: 500 }
    );
  }
} 