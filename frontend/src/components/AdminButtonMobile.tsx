import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export async function AdminButtonMobile() {
  const user = await currentUser();
  const isAdmin = user && (user.privateMetadata as Record<string, unknown>)?.role === "admin";

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-primary/10 transition-colors font-semibold"
    >
      <span className="material-symbols-outlined text-primary">
        admin_panel_settings
      </span>
      <span className="font-medium">Admin Dashboard</span>
    </Link>
  );
}
