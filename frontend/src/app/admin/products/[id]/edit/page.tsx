"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface ProductForm {
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  stock: number;
  productType: "product" | "service";
  categoryId?: string;
  benefits: string[];
  zodiacCompatibility: string[];
  isLabCertified: boolean;
}

const initialForm: ProductForm = {
  title: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: 0,
  productType: "product",
  categoryId: "",
  benefits: [],
  zodiacCompatibility: [],
  isLabCertified: false,
};

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string | undefined;
  const [isLoading, setIsLoading] = useState(!!productId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setIsLoading(false);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to save product");
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Edit Product</h1>
          <p className="text-slate-400">Update product details and inventory</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2">
              Product Title *
            </label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter product title"
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter product description"
              className="bg-slate-800 border-slate-700 text-white"
              rows={4}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                Original Price (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="0.00"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                Stock Quantity *
              </label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                placeholder="0"
                required
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Product Type */}
          <div>
            <label className="block text-white font-medium mb-2">
              Product Type *
            </label>
            <select
              value={form.productType}
              onChange={(e) =>
                setForm({
                  ...form,
                  productType: e.target.value as "product" | "service",
                })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="product">Physical Product</option>
              <option value="service">Service</option>
            </select>
          </div>

          {/* Lab Certified */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isLabCertified}
                onChange={(e) =>
                  setForm({ ...form, isLabCertified: e.target.checked })
                }
                className="w-4 h-4 rounded bg-slate-800 border-slate-600"
              />
              <span className="text-white">Lab Certified</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-700">
            <Link href="/admin/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSaving ? "Saving..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
