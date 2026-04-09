import { protectAdminRoute } from "@/lib/admin-auth";
import { db, products, categories } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check admin access
  const adminError = await protectAdminRoute();
  if (adminError) return adminError;

  try {
    const body = await request.json();

    const {
      title,
      description,
      price,
      originalPrice,
      stock,
      productType = "product",
      isLabCertified = false,
    } = body;

    if (!title || !price) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const result = await db
      .insert(products)
      .values({
        title,
        slug: slug + "-" + Date.now(),
        description: description || "",
        price: price.toString(),
        originalPrice: originalPrice ? originalPrice.toString() : null,
        stock: parseInt(stock) || 0,
        productType,
        isLabCertified,
        images: [],
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
