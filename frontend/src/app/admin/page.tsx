import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import AdminLayout from "@/components/admin/admin-layout";
import Link from "next/link";

export default async function AdminPage() {
  // Check admin role server-side
  const user = await currentUser();
  const isAdmin =
    user && (user.privateMetadata as Record<string, unknown>)?.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 mb-8">Welcome to the admin dashboard</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Products" value="42" />
          <StatCard title="Low Stock Items" value="5" />
          <StatCard title="Total Revenue" value="₹12,450" />
          <StatCard title="Recent Orders" value="128" />
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/products"
              className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              View All Products
            </Link>
            <Link
              href="/admin/products/new"
              className="p-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
            >
              Add New Product
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
