import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { reportEntitlements, astrologyReports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { slugToReportType, ReportSlug } from "@/lib/report-pricing";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Report slug is required" },
        { status: 400 }
      );
    }

    const reportType = slugToReportType(slug as ReportSlug);

    const [entitlement, existingReport] = await Promise.all([
      db.query.reportEntitlements.findFirst({
        where: and(
          eq(reportEntitlements.userId, userId),
          eq(reportEntitlements.reportType, reportType)
        ),
      }),
      db.query.astrologyReports.findFirst({
        where: and(
          eq(astrologyReports.userId, userId),
          eq(astrologyReports.reportType, reportType)
        ),
      }),
    ]);

    return NextResponse.json({
      hasEntitlement: !!entitlement || !!existingReport,
    });
  } catch (error: any) {
    console.error("Entitlement check error:", error);
    return NextResponse.json(
      { error: "Failed to check entitlement" },
      { status: 500 }
    );
  }
}
