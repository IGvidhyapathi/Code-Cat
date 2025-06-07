import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    console.log("Starting promo code validation");
    
    // Check authentication
    const { userId } = await auth();
    console.log("Auth check result:", { userId });
    
    if (!userId) {
      console.log("Authentication failed - no userId");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { promoCode, projectId } = body;

    if (!promoCode || !projectId) {
      console.log("Missing required fields:", { promoCode, projectId });
      return NextResponse.json(
        { error: "Promo code and project ID are required" },
        { status: 400 }
      );
    }

    // Verify that the project exists and get user info
    console.log("Verifying project exists:", projectId);
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          payments: {
            where: {
              userId: userId,
              status: "settled"
            }
          }
        }
      });

      if (!project) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 400 }
        );
      }

      // Check if user has already made a successful payment for this project
      if (project.payments.length > 0) {
        return NextResponse.json(
          { error: "You have already purchased this project" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error finding project:", e);
      return NextResponse.json(
        { error: "Failed to verify project" },
        { status: 500 }
      );
    }

    // Find marketer with the promo code
    console.log("Looking for marketer with code:", promoCode.toUpperCase());
    let marketer;
    try {
      marketer = await prisma.marketer.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          status: "approved"
        }
      });

      console.log("Marketer search result:", marketer ? { id: marketer.id, name: marketer.name } : null);

      if (!marketer) {
        return NextResponse.json(
          { error: "Invalid or expired promo code" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error finding marketer:", e);
      return NextResponse.json(
        { error: "Failed to validate promo code" },
        { status: 500 }
      );
    }

    // Check if the user has already used this promo code for any project
    console.log("Checking for existing promo code use by user");
    try {
      const existingUse = await prisma.projectPromoCode.findFirst({
        where: {
          projectId,
          marketerId: marketer.id,
          project: {
            payments: {
              some: {
                userId: userId,
                status: "settled"
              }
            }
          }
        }
      });

      console.log("Existing use check result:", { exists: !!existingUse });

      if (existingUse) {
        return NextResponse.json(
          { error: "You have already used this promo code" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error checking existing use:", e);
      return NextResponse.json(
        { error: "Failed to check promo code usage" },
        { status: 500 }
      );
    }

    // Return success without creating the record yet
    return NextResponse.json({
      success: true,
      marketer: {
        id: marketer.id,
        name: marketer.name
      }
    });
  } catch (error: any) {
    console.error("Detailed error in promo code validation:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { error: error?.message || "Failed to validate promo code" },
      { status: 500 }
    );
  }
} 