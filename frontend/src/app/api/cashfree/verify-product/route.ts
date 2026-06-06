import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, payments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyCashfreePayment } from "@/lib/cashfree";

interface CartItemPayload {
  product_id: string;
  quantity: number;
}

interface ShippingAddressPayload {
  name: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  line2?: string;
}

const isShippingAddress = (value: unknown): value is ShippingAddressPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const address = value as Partial<ShippingAddressPayload>;
  return Boolean(
    address.name &&
    address.line1 &&
    address.city &&
    address.state &&
    address.pincode &&
    address.phone,
  );
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      items: clientItems,
      total,
      shippingAddress,
    } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (!Array.isArray(clientItems)) {
      return NextResponse.json(
        { error: "Invalid items payload" },
        { status: 400 },
      );
    }

    if (!isShippingAddress(shippingAddress)) {
      return NextResponse.json(
        { error: "Invalid shipping address" },
        { status: 400 },
      );
    }

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.cashfreeOrderId, orderId),
    });

    if (existingOrder) {
      const existingPayment = await db.query.payments.findFirst({
        where: and(
          eq(payments.orderId, existingOrder.id),
          eq(payments.cashfreeOrderId, orderId),
        ),
      });

      if (existingPayment) {
        return NextResponse.json({ success: true, verified: true });
      }
    }

    const verification = await verifyCashfreePayment(orderId);

    if (verification.payment_status === "SUCCESS") {
      const cartEntries = await db.query.cartItems.findMany({
        where: eq(cartItems.userId, userId),
        with: { product: true },
      });

      if (cartEntries.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      const trustedItems = cartEntries.map((entry) => {
        const productPrice = Number(entry.product?.price);
        if (!Number.isFinite(productPrice) || productPrice < 0) {
          throw new Error("Invalid product price");
        }

        if (!Number.isInteger(entry.quantity) || entry.quantity <= 0) {
          throw new Error("Invalid cart quantity");
        }

        if (
          Number.isInteger(Number(entry.product.stock)) &&
          entry.quantity > Number(entry.product.stock)
        ) {
          throw new Error("Insufficient stock");
        }

        return {
          productId: entry.productId,
          title: entry.product.title,
          price: productPrice,
          quantity: entry.quantity,
          image: entry.product.images?.[0],
        };
      });

      const subtotal = trustedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const createdOrder = !existingOrder;
      const [newOrder] = existingOrder
        ? [existingOrder]
        : await db
            .insert(orders)
            .values({
              userId,
              cashfreeOrderId: orderId,
              status: "pending",
              subtotal: subtotal.toString(),
              total: subtotal.toString(),
              shippingAddress,
              itemsSnapshot: trustedItems,
              orderKind: "product",
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
        throw new Error("Failed to create or load order");
      }

      if (createdOrder) {
        await db.insert(orderItems).values(
          trustedItems.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            title: item.title,
            price: item.price.toString(),
            quantity: item.quantity,
            image: item.image,
          })),
        );
      }

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

      if (createdOrder) {
        try {
          await db.delete(cartItems).where(eq(cartItems.userId, userId));
        } catch (cartError) {
          console.error("Failed to clear cart after payment insert", {
            userId,
            cartItemIds: cartEntries.map((entry) => entry.id),
            error: cartError,
          });
        }
      }

      return NextResponse.json({ success: true, verified: true });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        status: verification.order_status,
      });
    }
  } catch (error: unknown) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
