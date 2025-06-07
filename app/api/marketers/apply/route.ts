import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";

// Schema for marketer application validation
const marketerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = marketerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone } = validationResult.data;

    try {
      // Check if email is already registered
      const existingMarketer = await prisma.marketer.findUnique({
        where: { email }
      });

      if (existingMarketer) {
        return NextResponse.json(
          { error: "Email already registered as a marketer" },
          { status: 400 }
        );
      }

      // Create new marketer
      const newMarketer = await prisma.marketer.create({
        data: {
          name,
          email,
          phone,
          status: "pending", // Default status
          code: "", // Will be set when approved
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      });

      // Also update the user's role in Clerk if needed
      try {
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            role: "marketer"
          }
        });
      } catch (clerkError) {
        console.error("Failed to update user role in Clerk:", clerkError);
        // Don't fail the request if Clerk update fails
      }

      return NextResponse.json({
        message: "Application submitted successfully",
        marketer: newMarketer
      }, { status: 201 });

    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database operation failed", details: dbError instanceof Error ? dbError.message : "Unknown error" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error processing marketer application:", error);
    return NextResponse.json(
      { error: "Failed to process application", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 