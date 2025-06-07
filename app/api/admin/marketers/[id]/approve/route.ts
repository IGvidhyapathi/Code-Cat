import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";



async function generateUniquePromoCode(name: string): Promise<string> {
  // Get first name only
  const firstName = name.split(' ')[0];
  
  // Take first 4 letters of the first name (or pad with 'X' if too short)
  let namePrefix = firstName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
  while (namePrefix.length < 4) {
    namePrefix += 'X';
  }

  // First try with '01' suffix
  const baseCode = `${namePrefix}01`;
  
  // Check if base code is available
  const existingMarketer = await prisma.marketer.findFirst({
    where: { code: baseCode }
  });

  if (!existingMarketer) {
    return baseCode;
  }

  // If base code is taken, increment the number until we find an available one
  for (let i = 2; i <= 99; i++) {
    const suffix = i.toString().padStart(2, '0');
    const promoCode = `${namePrefix}${suffix}`;

    const existingMarketer = await prisma.marketer.findFirst({
      where: { code: promoCode }
    });

    if (!existingMarketer) {
      return promoCode;
    }
  }

  throw new Error("Unable to generate a unique promo code. Too many similar codes exist.");
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Extract ID from URL
    const marketerId = req.nextUrl.pathname.split("/")[4]; // /api/admin/marketers/[id]/approve

    if (!marketerId) {
      return NextResponse.json({ error: "Invalid marketer ID" }, { status: 400 });
    }

    // Get marketer details with email
    const marketer = await prisma.marketer.findUnique({
      where: { id: marketerId },
      select: { 
        name: true,
        email: true
      }
    });

    if (!marketer) {
      return NextResponse.json({ error: "Marketer not found" }, { status: 404 });
    }

    try {
      // Generate unique promo code
      const promoCode = await generateUniquePromoCode(marketer.name);

      // Update marketer status and add promo code
      const updatedMarketer = await prisma.marketer.update({
        where: { id: marketerId },
        data: {
          status: 'approved',
          code: promoCode,
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
          await clerkClient.users.updateUser(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              role: "marketer"
            }
          });
        }
      } catch (clerkError) {
        console.error("Failed to update user role in Clerk:", clerkError);
        // Don't fail the request if Clerk update fails
      }

      return NextResponse.json({ 
        message: "Marketer approved successfully",
        promoCode: updatedMarketer.code
      });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ 
          error: error.message
        }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error approving marketer:", error);
    return NextResponse.json(
      { error: "Failed to approve marketer" },
      { status: 500 }
    );
  }
} 