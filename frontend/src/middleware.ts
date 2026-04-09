import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/shop(.*)",
  "/product(.*)",
  "/services(.*)",
  "/rashi(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect admin routes - check for authentication first
  if (isAdminRoute(request)) {
    try {
      const { userId, sessionClaims } = await auth.protect();
      
      // Check if user has admin role in private metadata
      const privateMetadata = (sessionClaims?.metadata as any)?.private || {};
      if (privateMetadata.role !== "admin") {
        // User is authenticated but not an admin - redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // If not authenticated, redirect to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  } else {
    // Protect other non-public routes
    try {
      await auth.protect();
    } catch {
      // If not authenticated, redirect to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
