import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all users with a higher limit
    const response = await fetch("https://api.clerk.com/v1/users?limit=100", {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await response.json();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 