import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyCashfreePayment } from "@/lib/cashfree";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, items: clientItems, total, shippingAddress } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const verification = await verifyCashfreePayment(orderId);

    if (verification.payment_status === "SUCCESS") {
      // Execute sequentially (Neon HTTP driver does not support transactions)
      // 1. Create the main order summary
      const [newOrder] = await db
        .insert(orders)
        .values({
          userId,
          cashfreeOrderId: orderId,
          status: "paid",
          subtotal: verification.order_amount.toString(),
          total: verification.order_amount.toString(),
          shippingAddress,
          itemsSnapshot: clientItems, // Note: ideally built from server cart items
          orderKind: "product",
        })
        .returning();

      // 2. Insert order items
      await db.insert(orderItems).values(
        clientItems.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.product_id,
          title: item.title,
          price: item.price.toString(),
          quantity: item.quantity,
          image: item.image,
        }))
      );

      // 3. Clear cart
      await db.delete(cartItems).where(eq(cartItems.userId, userId));

      // 4. Record payment log
      await db.insert(payments).values({
        orderId: newOrder.id,
        amount: verification.order_amount.toString(),
        currency: verification.order_currency,
        status: "captured",
        method: "cashfree",
        metadata: {
          cashfree_order_id: verification.order_id,
          raw_status: verification.order_status,
        },
      });

      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({ success: false, verified: false, status: verification.order_status });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
