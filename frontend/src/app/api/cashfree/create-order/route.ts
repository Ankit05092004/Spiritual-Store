import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createCashfreeOrder } from "@/lib/cashfree";

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
    const { customerPhone, returnPath } = body;

    const sanitizedPhone = sanitizeCustomerPhone(customerPhone);
    if (!sanitizedPhone) {
      return NextResponse.json(
        { error: "Invalid customer phone number" },
        { status: 400 },
      );
    }

    // Fetch the cart items and products to calculate the total on the server
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
      with: { product: true },
    });

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let sanitizedItems;
    try {
      sanitizedItems = items.map((item) => {
        const price = Number(item.product?.price);
        const quantity = Number(item.quantity);

        if (!Number.isFinite(price) || price < 0) {
          throw new Error("Invalid cart item price");
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Invalid cart item quantity");
        }

        return {
          ...item,
          price,
          quantity,
        };
      });
    } catch (validationError) {
      console.error("Cart validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid cart item data" },
        { status: 400 },
      );
    }

    // Calculate total on the server using sanitized values.
    const total = sanitizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderId = `order_${Date.now()}_${userId.slice(-5)}`;
    const sanitizedReturnPath = sanitizeReturnPath(
      returnPath,
      "/api/cashfree/verify-product",
    );

    const order = await createCashfreeOrder({
      orderId,
      amount: total, // Use calculated total, not a client-provided amount
      customerDetails: {
        customerId: userId,
        customerPhone: sanitizedPhone,
      },
      returnPath: sanitizedReturnPath,
    });

    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error("Cashfree order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
