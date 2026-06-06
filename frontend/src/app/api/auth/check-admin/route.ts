import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }

  try {
    const user = await currentUser();
    const isAdmin = user && (user.privateMetadata as Record<string, unknown>)?.role === "admin";
    return NextResponse.json({ isAdmin: !!isAdmin }, { status: 200 });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
