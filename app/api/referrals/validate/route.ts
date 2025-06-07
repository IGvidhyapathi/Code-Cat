import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Get request body
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    // Find marketer with the given code
    const marketer = await prisma.marketer.findFirst({
      where: {
        code: code,
        status: "approved"
      }
    });

    if (!marketer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
    }

    // Return marketer ID for tracking
    return NextResponse.json({
      marketerId: marketer.id,
      message: "Referral code validated successfully"
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 }
    );
  }
} 