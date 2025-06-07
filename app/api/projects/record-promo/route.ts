import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    console.log("Starting promo code recording");
    
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

    const { promoCode, projectId, paymentId } = body;

    if (!promoCode || !projectId || !paymentId) {
      console.log("Missing required fields:", { promoCode, projectId, paymentId });
      return NextResponse.json(
        { error: "Promo code, project ID, and payment ID are required" },
        { status: 400 }
      );
    }

    // Get the database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      console.log("Database user not found:", { clerkId: userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify payment exists and belongs to user
    console.log("Verifying payment:", paymentId);
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          razorpayPaymentId: paymentId,
          userId: dbUser.id,
          status: "settled"
        }
      });

      if (!payment) {
        console.log("Payment not found or unauthorized:", { paymentId, userId: dbUser.id });
        return NextResponse.json(
          { error: "Invalid or unauthorized payment" },
          { status: 400 }
        );
      }

      console.log("Payment verified:", { paymentId, userId: dbUser.id });
    } catch (e) {
      console.error("Error finding payment:", e);
      return NextResponse.json(
        { error: "Failed to verify payment" },
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

    // Check if this promo code has already been used for this project
    try {
      const existingRecord = await prisma.projectPromoCode.findFirst({
        where: {
          projectId,
          marketerId: marketer.id
        }
      });

      if (existingRecord) {
        console.log("Promo code already used for this project:", { projectId, marketerId: marketer.id });
        return NextResponse.json(
          { error: "This promo code has already been used for this project" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error checking existing promo code use:", e);
      return NextResponse.json(
        { error: "Failed to check promo code usage" },
        { status: 500 }
      );
    }

    // Create the promo code record
    console.log("Creating promo code record");
    try {
      const promoCodeRecord = await prisma.projectPromoCode.create({
        data: {
          projectId,
          marketerId: marketer.id
        }
      });

      console.log("Promo code record created:", promoCodeRecord);

      return NextResponse.json({
        success: true,
        promoCodeRecord
      });
    } catch (e) {
      console.error("Error creating promo code record:", e);
      return NextResponse.json(
        { error: "Failed to record promo code" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Detailed error in promo code recording:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { error: error?.message || "Failed to record promo code" },
      { status: 500 }
    );
  }
} 