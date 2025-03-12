import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.project.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting project count:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
} 