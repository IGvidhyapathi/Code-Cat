import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface ProjectWithPayment {
  project: {
    id: string;
    title: string;
    price: number;
    createdAt: string;
    payment: {
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
    };
  };
}

const COMMISSION_RATE = 0.05; // 5% commission rate

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });
    
    if (!user || !user.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }
    
    const marketerCheck = await prisma.marketer.findFirst({
      where: {
        email: user.email,
        status: 'approved',
      },
    });

    if (!marketerCheck) {
      return NextResponse.json(
        { 
          error: "Marketer account not found or not approved",
          details: "Please apply for a marketer account or wait for approval."
        }, 
        { status: 403 }
      );
    }

    // Get marketer data with their promo code usage and earnings
    const marketer = await prisma.$queryRaw`
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
                'price', p.price,
                'createdAt', p."createdAt",
                'payment', json_build_object(
                  'amount', COALESCE(pay.amount, p.price),
                  'currency', COALESCE(pay.currency, 'INR'),
                  'status', COALESCE(pay.status, 'pending'),
                  'createdAt', COALESCE(pay."createdAt", NOW())
                )
              )
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'::json
        ) as projects,
        COALESCE(
          SUM(
            CASE 
              WHEN pay.status = 'settled' THEN COALESCE(pay.amount, p.price) * 0.05
              ELSE 0 
            END
          ),
          0
        ) as total_earnings
      FROM "marketers" m
      LEFT JOIN "project_promo_codes" ppc ON m.id = ppc."marketerId"
      LEFT JOIN "projects" p ON ppc."projectId" = p.id
      LEFT JOIN "payments" pay ON ppc."paymentId" = pay.id
      WHERE m.email = ${user.email}
      GROUP BY m.id, m.name, m.email, m.phone, m.code, m.status, m."createdAt"
    `;

    if (!marketer || !Array.isArray(marketer) || marketer.length === 0) {
      return NextResponse.json({ error: "Failed to fetch marketer data" }, { status: 500 });
    }

    // Calculate statistics
    const marketerData = marketer[0];
    const projects = Array.isArray(marketerData.projects) ? marketerData.projects : [];
    
    // Only count settled payments as successful
    const settledProjects = projects.filter((p: ProjectWithPayment) => 
      p?.project?.payment?.status === 'settled'
    );

    // Calculate total earnings from the database sum
    const totalEarnings = marketerData.total_earnings || 0;

    const averageCommission = settledProjects.length > 0 
      ? totalEarnings / settledProjects.length
      : 0;

    const stats = {
      totalProjects: projects.length,
      totalEarnings,
      successfulSales: settledProjects.length,
      pendingPayments: projects.filter((p: ProjectWithPayment) => 
        p?.project?.payment?.status !== 'settled'
      ).length,
      averageCommission
    };

    // Log data for debugging
    console.log('Projects:', projects);
    console.log('Settled Projects:', settledProjects);
    console.log('Stats:', stats);

    return NextResponse.json({
      marketer: {
        ...marketerData,
        projects: projects.map((p: ProjectWithPayment) => ({
          project: {
            ...p.project,
            payment: {
              amount: p?.project?.payment?.amount || p?.project?.price || 0,
              currency: p?.project?.payment?.currency || 'INR',
              status: p?.project?.payment?.status || 'pending',
              createdAt: p?.project?.payment?.createdAt || new Date().toISOString()
            }
          }
        }))
      },
      stats,
      commissionRate: COMMISSION_RATE * 100 // Send commission rate to frontend
    });
  } catch (error) {
    console.error("Error fetching marketer dashboard data:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
} 