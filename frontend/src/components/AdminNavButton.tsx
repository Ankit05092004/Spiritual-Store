import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function AdminNavButton() {
  const user = await currentUser();
  const isAdmin = user && (user.privateMetadata as Record<string, unknown>)?.role === "admin";

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href="/admin" className="hidden sm:block">
      <Button
        variant="outline"
        size="sm"
        aria-label="Admin Dashboard"
        className="rounded-full text-primary border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors font-semibold"
      >
        <span className="material-symbols-outlined text-base mr-1.5">admin_panel_settings</span>
        Admin
      </Button>
    </Link>
  );
}
