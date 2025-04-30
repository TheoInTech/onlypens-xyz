import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that are accessible to everyone
const publicRoutes = ["/", "/about", "/terms", "/privacy"];

// Routes that require a wallet connection and profile
const profileProtectedRoutes = ["/dashboard", "/profile", "/gigs"];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get wallet connection status from cookies
  const isWalletConnected =
    request.cookies.get("wallet-connected")?.value === "true";

  // Hardcoded profile check (will be replaced with actual check later with Supabase profile check)
  const profileExists = false;

  // Public routes are accessible to everyone
  if (publicRoutes.some((route) => path === route)) {
    // Otherwise allow access to public routes
    return NextResponse.next();
  }

  // Handle onboarding route
  if (path.startsWith("/onboarding")) {
    // Only wallets without profiles should access onboarding
    if (!isWalletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If profile already exists, redirect to dashboard
    if (profileExists) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Otherwise, allow access to onboarding
    return NextResponse.next();
  }

  // Handle profile-protected routes
  if (profileProtectedRoutes.some((route) => path.startsWith(route))) {
    // If wallet is not connected, redirect to home
    if (!isWalletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If no profile exists, redirect to onboarding
    if (!profileExists) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // Otherwise, allow access to protected routes
    return NextResponse.next();
  }

  // For all other requests, continue
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
