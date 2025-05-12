import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract the ID from the dynamic route
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get the user from Clerk
    const user = await clerkClient.users.getUser(id);

    return NextResponse.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
