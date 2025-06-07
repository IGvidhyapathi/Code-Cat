// This file will be renamed to validate-marketer-code/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    console.log("Starting marketer code validation");
    
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

    const { marketerCode, projectId } = body;

    if (!marketerCode || !projectId) {
      console.log("Missing required fields:", { marketerCode, projectId });
      return NextResponse.json(
        { error: "Marketer code and project ID are required" },
        { status: 400 }
      );
    }

    // Verify that the project exists
    console.log("Verifying project exists:", projectId);
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return NextResponse.json(
          { error: "Invalid project ID" },
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

    // Check if the code has already been used for this project by this user
    console.log("Checking for existing marketer code use by this user");
    try {
      const existingUse = await prisma.projectPromoCode.findFirst({
        where: {
          projectId,
          marketerId: marketer.id,
          userId
        }
      });

      console.log("Existing use check result:", { exists: !!existingUse });

      if (existingUse) {
        return NextResponse.json(
          { error: "You have already used this marketer code for this project" },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Error checking existing use:", e);
      return NextResponse.json(
        { error: "Failed to check marketer code usage" },
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
    console.error("Detailed error in marketer code validation:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { error: error?.message || "Failed to validate marketer code" },
      { status: 500 }
    );
  }
} 