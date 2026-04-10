import { protectAdminRoute } from "@/lib/admin-auth";
import { paymentProtection } from "@/lib/arcjet";
import { db, products } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  // Apply rate limiting
  const decision = await paymentProtection.protect(request, { requested: 1 });
  if (decision.isDenied()) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, action } = body;

    if (quantity === undefined || !action) {
      return NextResponse.json(
        { error: "Quantity and action are required" },
        { status: 400 }
      );
    }

    // Validate and parse quantity
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty)) {
      return NextResponse.json(
        { error: "Quantity must be a valid number" },
        { status: 400 }
      );
    }

    // Validate action
    if (!["add", "subtract", "set"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use add, subtract, or set" },
        { status: 400 }
      );
    }

    // Get current product for response
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousStock = product[0].stock;
    let updateValue;

    // Use atomic database expression based on action
    if (action === "add") {
      updateValue = sql`${products.stock} + ${qty}`;
    } else if (action === "subtract") {
      updateValue = sql`GREATEST(0, ${products.stock} - ${qty})`;
    } else {
      // action === "set"
      updateValue = sql`GREATEST(0, ${qty})`;
    }

    const result = await db
      .update(products)
      .set({
        stock: updateValue,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      productId: id,
      previousStock,
      newStock: result[0].stock,
      action,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
