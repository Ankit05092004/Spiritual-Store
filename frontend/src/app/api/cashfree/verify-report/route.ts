import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { orders, payments, reportEntitlements } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getReportPrice, slugToReportType } from "@/lib/report-pricing";
import { verifyCashfreePayment } from "@/lib/cashfree";

const isProduction = process.env.NODE_ENV === "production";

const maskIdentifier = (value: string) => {
  if (!value || value.length <= 4) {
    return "****";
  }
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
};

const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (!isProduction) {
      console.info(message, meta);
    }
  },
};

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
    const expectedPrice = getReportPrice(slug);

    if (Number(verification.order_amount) !== expectedPrice) {
      throw new Error("Payment amount does not match expected report price");
    }

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

      if (!newOrder) {
        console.error("Failed to create or load order. Details:", {
          orderId,
          userId,
          reportType,
          verificationStatus: verification.order_status,
        });
        throw new Error("Failed to create or load order");
      }

      logger.debug("Order created/loaded successfully", {
        orderId: isProduction ? maskIdentifier(newOrder.id) : newOrder.id,
        cashfreeOrderId: isProduction ? maskIdentifier(orderId) : orderId,
        userId: isProduction ? maskIdentifier(userId) : userId,
      });

      // 2. Grant report entitlement
      await db
        .insert(reportEntitlements)
        .values({
          userId,
          reportType,
          orderId: newOrder.id,
        })
        .onConflictDoNothing({
          target: [reportEntitlements.userId, reportEntitlements.reportType],
        }); // Idempotent support

      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.orderId, newOrder.id),
          eq(payments.cashfreeOrderId, verification.order_id),
        ),
      });

      if (!existingPayment) {
        await db.insert(payments).values({
          orderId: newOrder.id,
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
        .where(eq(orders.id, newOrder.id));

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
