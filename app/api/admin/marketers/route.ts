import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface ProjectData {
  project: {
    id: string;
    title: string;
    createdAt: Date;
  }
}

interface MarketerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  code: string | null;
  status: string;
  createdAt: Date;
  projects: ProjectData[];
}

interface FormattedProject {
  id: string;
  title: string;
  createdAt: Date;
}

interface FormattedMarketer extends Omit<MarketerData, 'projects'> {
  projects: FormattedProject[];
}

export async function GET() {
  try {
    console.log("Starting marketers API request");
    
    const { userId } = await auth();
    console.log("Auth check result:", { userId });
    
    if (!userId) {
      console.log("Authentication failed - no userId");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Use Prisma's query builder
    console.log("Fetching marketers from database");
    const marketers = await prisma.$queryRaw<MarketerData[]>`
      SELECT 
        m.id,
        m.name,
        m.email,
        m.phone,
        m.code,
        m.status,
        m."createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'project', json_build_object(
                'id', p.id,
                'title', p.title,
                'createdAt', p."createdAt"
              )
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as projects
      FROM "marketers" m
      LEFT JOIN "project_promo_codes" ppc ON m.id = ppc."marketerId"
      LEFT JOIN "projects" p ON ppc."projectId" = p.id
      GROUP BY m.id, m.name, m.email, m.phone, m.code, m.status, m."createdAt"
      ORDER BY m."createdAt" DESC
    `;

    // Transform the projects data to match the frontend expectations
    const formattedMarketers: FormattedMarketer[] = marketers.map((marketer: MarketerData) => ({
      ...marketer,
      projects: marketer.projects.map((p: ProjectData) => ({
        id: p.project.id,
        title: p.project.title,
        createdAt: p.project.createdAt
      }))
    }));
    
    console.log("Successfully fetched marketers:", { count: formattedMarketers.length });

    return NextResponse.json(formattedMarketers);
  } catch (error: any) {
    console.error("Detailed error in marketers API:", {
      name: error?.name || 'Unknown error',
      message: error?.message || 'No error message available',
      stack: error?.stack || 'No stack trace available'
    });
    
    return NextResponse.json(
      { 
        error: "Failed to fetch marketers",
        details: error?.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 