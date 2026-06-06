import { protectAdminRoute } from "@/lib/admin-auth";
import { db, products } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  try {
    const { id } = await params;
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      price,
      originalPrice,
      stock,
      productType,
      isLabCertified,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    const result = await db
      .update(products)
      .set({
        title,
        description: description || "",
        price: price.toString(),
        originalPrice: originalPrice ? originalPrice.toString() : null,
        stock: parseInt(stock) || 0,
        productType: productType || "product",
        isLabCertified: isLabCertified || false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  try {
    const { id } = await params;

    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
