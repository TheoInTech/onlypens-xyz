import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get wallet connection status from cookies using the native cookies API
  const isWalletConnected =
    request.cookies.get("wallet-connected")?.value === "true";

  // Handle onboarding route
  if (path.startsWith("/onboarding")) {
    // If on onboarding page without wallet connected, redirect to home
    if (!isWalletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Otherwise, allow access to onboarding
    return NextResponse.next();
  }

  // Handle all other routes
  // If wallet is connected and not already on onboarding, redirect to onboarding
  if (isWalletConnected) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
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
