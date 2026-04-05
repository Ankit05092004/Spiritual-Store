import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCashfreeOrder } from "@/lib/cashfree";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customerPhone, returnPath } = body;

    // Fetch the cart items and products to calculate the total on the server
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: { product: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total on the server
    const total = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    const orderId = `order_${Date.now()}_${userId.slice(-5)}`;

    const order = await createCashfreeOrder({
      orderId,
      amount: total, // Use calculated total, not a client-provided amount
      customerDetails: {
        customerId: userId,
        customerPhone,
      },
      returnPath: returnPath || "/api/cashfree/verify-product",
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Cashfree order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
