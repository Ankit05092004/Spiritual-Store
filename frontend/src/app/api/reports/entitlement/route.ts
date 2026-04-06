import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, reportEntitlements } from "@/db";
import * as Sentry from "@sentry/nextjs";
import { eq, and } from "drizzle-orm";
import { isReportSlug, slugToReportType } from "@/lib/report-pricing";

export async function GET(req: Request) {
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
        { status: 400 },
      );
    }

    if (!isReportSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid report slug" },
        { status: 400 },
      );
    }

    const reportType = slugToReportType(slug);

    const entitlement = await db.query.reportEntitlements.findFirst({
      where: and(
        eq(reportEntitlements.userId, userId),
        eq(reportEntitlements.reportType, reportType),
      ),
    });

    return NextResponse.json({
      hasEntitlement: !!entitlement,
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: { endpoint: "reports-entitlement" },
      extra: { route: "/api/reports/entitlement" },
    });
    console.error(
      "Entitlement check error:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Failed to check entitlement" },
      { status: 500 },
    );
  }
}
