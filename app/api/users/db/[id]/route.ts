import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the route
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id },
      select: { clerkId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ clerkId: user.clerkId });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
