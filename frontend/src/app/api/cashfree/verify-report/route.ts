import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { orders, payments, reportEntitlements } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { slugToReportType } from "@/lib/report-pricing";
import { verifyCashfreePayment } from "@/lib/cashfree";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, slug } = await req.json();

    if (!orderId || !slug) {
      return NextResponse.json(
        { error: "Missing orderId or slug" },
        { status: 400 },
      );
    }

    const reportType = slugToReportType(slug);
    const verification = await verifyCashfreePayment(orderId);

    if (verification.payment_status === "SUCCESS") {
      const [newOrder] = await db
        .insert(orders)
        .values({
          userId,
          cashfreeOrderId: orderId,
          status: "pending",
          subtotal: verification.order_amount.toString(),
          total: verification.order_amount.toString(),
          shippingAddress: {
            name: "N/A - Digital",
            line1: "N/A",
            city: "N/A",
            state: "N/A",
            pincode: "000000",
            phone: "0000000000",
          },
          itemsSnapshot: [
            {
              productId: "digital-report",
              title: `${reportType} Report`,
              price: verification.order_amount,
              quantity: 1,
            },
          ],
          orderKind: "report",
        })
        .onConflictDoNothing({ target: [orders.cashfreeOrderId] })
        .returning()
        .then(async (rows) => {
          if (rows[0]) {
            return rows;
          }

          const fallbackOrder = await db.query.orders.findFirst({
            where: eq(orders.cashfreeOrderId, orderId),
          });

          return fallbackOrder ? [fallbackOrder] : [];
        });

      if (!newOrder || !newOrder[0]) {
        throw new Error("Failed to create or load order");
      }

      // 2. Grant report entitlement
      await db
        .insert(reportEntitlements)
        .values({
          userId,
          reportType,
          orderId: newOrder[0].id,
        })
        .onConflictDoNothing({
          target: [reportEntitlements.userId, reportEntitlements.reportType],
        }); // Idempotent support

      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.orderId, newOrder[0].id),
          eq(payments.cashfreeOrderId, verification.order_id),
        ),
      });

      if (!existingPayment) {
        await db.insert(payments).values({
          orderId: newOrder[0].id,
          cashfreeOrderId: verification.order_id,
          amount: verification.order_amount.toString(),
          currency: verification.order_currency,
          status: "captured",
          method: "cashfree",
          metadata: {
            cashfree_order_id: verification.order_id,
            raw_status: verification.order_status,
          },
        });
      }

      await db
        .update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, newOrder[0].id));

      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        status: verification.order_status,
      });
    }
  } catch (error: unknown) {
    console.error("Report payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
