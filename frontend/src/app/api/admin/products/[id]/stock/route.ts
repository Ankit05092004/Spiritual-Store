import { protectAdminRoute } from "@/lib/admin-auth";
import { db, products } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

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

    // Get current stock
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let newStock = product[0].stock;

    if (action === "add") {
      newStock += parseInt(quantity);
    } else if (action === "subtract") {
      newStock = Math.max(0, newStock - parseInt(quantity));
    } else if (action === "set") {
      newStock = parseInt(quantity);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use add, subtract, or set" },
        { status: 400 }
      );
    }

    const result = await db
      .update(products)
      .set({
        stock: newStock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      productId: id,
      previousStock: product[0].stock,
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
