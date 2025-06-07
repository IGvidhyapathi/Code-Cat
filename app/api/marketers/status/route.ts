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

    // Get email from request body
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find marketer by email
    const marketer = await prisma.marketer.findUnique({
      where: { email },
      select: {
        code: true,
        status: true
      }
    });

    if (!marketer) {
      return NextResponse.json({ error: "Marketer not found" }, { status: 404 });
    }

    return NextResponse.json(marketer);
  } catch (error) {
    console.error("Error fetching marketer status:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketer status" },
      { status: 500 }
    );
  }
} 