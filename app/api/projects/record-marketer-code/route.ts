import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    console.log("Starting marketer code recording");
    
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

    const { marketerCode, projectId, paymentId } = body;

    if (!marketerCode || !projectId || !paymentId) {
      console.log("Missing required fields:", { marketerCode, projectId, paymentId });
      return NextResponse.json(
        { error: "Marketer code, project ID, and payment ID are required" },
        { status: 400 }
      );
    }

    // Verify that the project exists and payment is recorded
    console.log("Verifying project and payment:", { projectId, paymentId });
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          payments: {
            where: { id: paymentId }
          }
        }
      });

      if (!project) {
        return NextResponse.json(
          { error: "Invalid project ID" },
          { status: 400 }
        );
      }

      if (!project.payments.length) {
        return NextResponse.json(
          { error: "Payment not found for this project" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error verifying project and payment:", e);
      return NextResponse.json(
        { error: "Failed to verify project and payment" },
        { status: 500 }
      );
    }

    // Find marketer with the code
    console.log("Looking for marketer with code:", marketerCode.toUpperCase());
    let marketer;
    try {
      marketer = await prisma.marketer.findFirst({
        where: {
          code: marketerCode.toUpperCase(),
          status: "approved"
        }
      });

      console.log("Marketer search result:", marketer ? { id: marketer.id, name: marketer.name } : null);

      if (!marketer) {
        return NextResponse.json(
          { error: "Invalid or expired marketer code" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error finding marketer:", e);
      return NextResponse.json(
        { error: "Failed to validate marketer code" },
        { status: 500 }
      );
    }

    // Record the marketer code use
    console.log("Recording marketer code use");
    try {
      const promoCodeUse = await prisma.projectPromoCode.create({
        data: {
          projectId,
          marketerId: marketer.id,
          paymentId,
          userId
        }
      });

      console.log("Marketer code use recorded:", promoCodeUse);

      return NextResponse.json({
        success: true,
        marketer: {
          id: marketer.id,
          name: marketer.name
        }
      });
    } catch (e) {
      console.error("Error recording marketer code use:", e);
      return NextResponse.json(
        { error: "Failed to record marketer code use" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Detailed error in marketer code recording:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { error: error?.message || "Failed to record marketer code use" },
      { status: 500 }
    );
  }
} 