import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getReportPrice } from "@/lib/report-pricing";
import { createCashfreeOrder } from "@/lib/cashfree";
import { randomUUID } from "crypto";

const sanitizeCustomerPhone = (phone: unknown) => {
  if (typeof phone !== "string") {
    return null;
  }

  const numeric = phone.replace(/\D/g, "");
  if (numeric.length === 12 && numeric.startsWith("91")) {
    return numeric.substring(2);
  }

  if (numeric.length === 10) {
    return numeric;
  }

  return null;
};

const sanitizeReturnPath = (value: unknown, fallback: string) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes(":")
  ) {
    return fallback;
  }

  return trimmed;
};

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
        { status: 400 },
      );
    }

    // Get the price securely on the server
    let amount: number;
    try {
      amount = getReportPrice(slug);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const clerkUser = await currentUser();
    const customerEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400 },
      );
    }

    const sanitizedPhone = sanitizeCustomerPhone(customerPhone);
    if (!sanitizedPhone) {
      return NextResponse.json(
        { error: "Invalid customer phone number" },
        { status: 400 },
      );
    }

    // The order ID ensures uniqueness taking user ID + timestamp, without risking truncation breaking it
    const shortUid = userId.slice(-8);
    const timestamp = Date.now().toString();
    const randomSuffix = randomUUID().replace(/-/g, "").slice(0, 8);
    // Limit slug to avoid exceeding 50 char limit of Cashfree order_id
    const safeSlug = slug.slice(0, 12);
    const orderId = `rep_${safeSlug}_${shortUid}_${timestamp}_${randomSuffix}`
      .replace(/[^a-zA-Z0-9_]+/g, "_")
      .slice(0, 50);
    const sanitizedReturnPath = sanitizeReturnPath(
      returnPath,
      `/reports/${slug}`,
    );

    const order = await createCashfreeOrder({
      orderId,
      amount,
      customerDetails: {
        customerId: userId,
        customerPhone: sanitizedPhone,
        customerEmail,
        customerName:
          `${clerkUser?.firstName || "Astra"} ${clerkUser?.lastName || "User"}`.trim(),
      },
      returnPath: sanitizedReturnPath,
    });

    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error("Cashfree report order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create report order" },
      { status: 500 },
    );
  }
}
