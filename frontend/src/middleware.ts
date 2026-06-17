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

// Define admin routes that require authentication (role check happens in page/API)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // Protect admin routes and other routes - require authentication
  // Role-based access control is handled by individual pages/API routes using isUserAdmin()
  try {
    await auth.protect();
  } catch {
    // If not authenticated, redirect to sign-in
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude the Sentry tunnel route, Next.js internals, and static files
    "/((?!monitoring|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
