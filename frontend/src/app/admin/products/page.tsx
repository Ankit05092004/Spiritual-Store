"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/admin-layout";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  price: string;
  stock: number;
  productType: string;
  category?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/products");
      
      if (!response.ok) {
        if (response.status === 403) {
          setError("You do not have permission to access this page");
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "title",
      header: "Product Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => `₹${row.original.price}`,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <span className={stock < 10 ? "text-red-400 font-semibold" : ""}>
            {stock} {stock < 10 && stock > 0 && <AlertCircle className="inline h-4 w-4 ml-1" />}
          </span>
        );
      },
    },
    {
      accessorKey: "productType",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.productType === "product" ? "Physical" : "Service"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${row.original.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(row.original);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Products</h1>
            <p className="text-slate-400">Manage your product inventory and details</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Add New Product
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <DataTable
            columns={columns}
            data={products}
            isLoading={isLoading}
            onRowClick={(product) => {
              router.push(`/admin/products/${product.id}/edit`);
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Delete Product?</h2>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete "{selectedProduct.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
