import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getReportPrice, slugToReportType } from "@/lib/report-pricing";
import { createCashfreeOrder } from "@/lib/cashfree";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, customerPhone, returnPath } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Report slug is required" },
        { status: 400 }
      );
    }

    // Get the price securely on the server
    let amount: number;
    let reportType: string;
    try {
      amount = getReportPrice(slug);
      reportType = slugToReportType(slug);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const clerkUser = await currentUser();

    // The order ID ensures uniqueness taking user ID + timestamp, without risking truncation breaking it
    const shortUid = userId.slice(-8);
    const timestamp = Date.now().toString().slice(-6);
    // Limit slug to avoid exceeding 50 char limit of Cashfree order_id
    const safeSlug = slug.slice(0, 20); 
    const orderId = `rep_${safeSlug}_${shortUid}_${timestamp}`.replace(/[^a-zA-Z0-9_]+/g, "_");

    const order = await createCashfreeOrder({
      orderId,
      amount,
      customerDetails: {
        customerId: userId,
        customerPhone: customerPhone || "9999999999",
        customerEmail: clerkUser?.emailAddresses[0]?.emailAddress,
        customerName: `${clerkUser?.firstName || "Astra"} ${clerkUser?.lastName || "User"}`.trim(),
      },
      returnPath: returnPath || `/reports/${slug}`,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Cashfree report order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create report order" },
      { status: 500 }
    );
  }
}
