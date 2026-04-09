import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Check if the current user is an admin based on Clerk private metadata
 * Returns true if user has role: "admin" in privateMetadata
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return false;
    }

    // Access private metadata directly from user object
    const privateMetadata = (user.privateMetadata as any) || {};
    return privateMetadata.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Protect an API route by checking for admin role
 * Returns an error response if user is not an admin
 */
export async function protectAdminRoute(): Promise<NextResponse | null> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized - Please sign in" },
      { status: 401 }
    );
  }

  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  return null; // User is admin, proceed
}

/**
 * Get current user's admin metadata
 */
export async function getAdminMetadata() {
  try {
    const user = await currentUser();
    if (!user) return {};
    return (user.privateMetadata as any) || {};
  } catch (error) {
    console.error("Error fetching admin metadata:", error);
    return {};
  }
}
