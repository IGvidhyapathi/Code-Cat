import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Check if user already has a seller application
    const existingSellers = await prisma.$queryRaw`
      SELECT id FROM "sellers" WHERE "userId" = ${userId}
    `;

    if (existingSellers && Array.isArray(existingSellers) && existingSellers.length > 0) {
      return NextResponse.json(
        { error: "You already have a seller application" },
        { status: 400 }
      );
    }

    // Check if email is already in use
    const existingEmails = await prisma.$queryRaw`
      SELECT id FROM "sellers" WHERE email = ${email}
    `;

    if (existingEmails && Array.isArray(existingEmails) && existingEmails.length > 0) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Create new seller application using raw SQL
    await prisma.$executeRaw`
      INSERT INTO "sellers" (
        id, name, email, phone, status, "userId", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${name}, ${email}, ${phone}, 'rejected', ${userId}, NOW(), NOW()
      )
    `;

    // Fetch the created seller
    const newSellers = await prisma.$queryRaw<Seller[]>`
      SELECT * FROM "sellers" WHERE "userId" = ${userId}
    `;

    if (!newSellers || newSellers.length === 0) {
      throw new Error("Failed to create seller application");
    }

    return NextResponse.json(newSellers[0]);
  } catch (error) {
    console.error("Error creating seller application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sellers = await prisma.$queryRaw<Seller[]>`
      SELECT * FROM "sellers"
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(sellers);
  } catch (error) {
    console.error("Error fetching seller applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
} 