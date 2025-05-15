import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

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

    // Get current user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            clerkId: userId,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || "",
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
          { error: "Failed to create user account" },
          { status: 500 }
        );
      }
    }

    // Check if user already has a seller application
    const existingSellers = await prisma.$queryRaw`
      SELECT id FROM "sellers" WHERE "userId" = ${dbUser.id}
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

    try {
      // Create new seller application using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "sellers" (
          id, name, email, phone, status, "userId", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${name}, ${email}, ${phone}, 'applied', ${dbUser.id}, NOW(), NOW()
        )
      `;

      // Fetch the created seller
      const newSellers = await prisma.$queryRaw<Seller[]>`
        SELECT * FROM "sellers" WHERE "userId" = ${dbUser.id}
      `;

      if (!newSellers || newSellers.length === 0) {
        throw new Error("Failed to create seller application");
      }

      return NextResponse.json(newSellers[0]);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error occurred while creating application" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating seller application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
} 