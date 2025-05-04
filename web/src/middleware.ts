import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that are accessible to everyone
const publicRoutes = ["/", "/about", "/terms", "/privacy"];

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Debug logs
  console.log("Middleware processing path:", path);

  // Get wallet connection status from cookies
  const isWalletConnected =
    request.cookies.get("wallet-connected")?.value === "true";

  // Hardcoded profile check (will be replaced with actual check later with Supabase profile check)
  const profileExists = process.env.NEXT_PUBLIC_PROFILE_EXISTS === "true";

  // Get wallet address from cookies for redirect purposes
  const walletAddress = request.cookies.get("wallet-address")?.value;

  // Extract the address from the path
  const pathSegments = path.split("/").filter(Boolean);
  const addressParam = pathSegments[0];

  // Handle root path redirect for authenticated users with profiles
  if (path === "/" && isWalletConnected && profileExists && walletAddress) {
    console.log("Redirecting from root to dashboard");
    return NextResponse.redirect(
      new URL(`/${walletAddress}/dashboard`, request.url)
    );
  }

  // Public routes are accessible to everyone (except root which is handled above)
  if (publicRoutes.some((route) => path === route && route !== "/")) {
    return NextResponse.next();
  }

  // Only proceed with address-based routing if we have an address parameter
  if (addressParam) {
    // Check if this is an onboarding route (second segment is "onboarding")
    const isOnboardingRoute = pathSegments[1] === "onboarding";

    // If wallet is not connected, redirect to home
    if (!isWalletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if wallet address in URL matches the connected wallet
    if (walletAddress && addressParam !== walletAddress) {
      return NextResponse.redirect(
        new URL(`/${walletAddress}/dashboard`, request.url)
      );
    }

    // Handle onboarding route specifically
    if (isOnboardingRoute) {
      // If profile already exists, redirect to dashboard
      if (profileExists) {
        return NextResponse.redirect(
          new URL(`/${addressParam}/dashboard`, request.url)
        );
      }

      // Allow access to onboarding for users without profiles
      return NextResponse.next();
    }

    // For all other address-based routes (dashboard, profile, gigs, etc.)
    // If no profile exists, redirect to onboarding
    if (!profileExists) {
      return NextResponse.redirect(
        new URL(`/${addressParam}/onboarding`, request.url)
      );
    }

    // Allow access to protected routes
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
