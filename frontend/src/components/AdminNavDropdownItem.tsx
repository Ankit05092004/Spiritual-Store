import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export async function AdminNavDropdownItem() {
  const user = await currentUser();
  const isAdmin = user && (user.privateMetadata as Record<string, unknown>)?.role === "admin";

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <span className="material-symbols-outlined">admin_panel_settings</span>
      <span className="font-medium">Admin Dashboard</span>
    </Link>
  );
}
