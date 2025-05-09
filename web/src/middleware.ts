import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes that are accessible to everyone
const publicRoutes = ["/", "/about", "/terms", "/privacy"];

// Routes that need profile check
const profileRequiredRoutes = [
  "/dashboard",
  "/gigs",
  "/gigs/create",
  "/gigs/:gigId",
];

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path is in public routes - allow immediate access
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Validate the JWT token properly using next-auth's getToken
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // TODO: This should be fetched from your database or API
  // For now, using a hardcoded value to prevent the infinite loop
  const profileExists = process.env.NEXT_PUBLIC_PROFILE_EXISTS === "true"; // Replace with actual profile check logic

  // If the route is in the profileRequiredRoutes array and no profile exists, redirect to onboarding
  if (
    !profileExists &&
    profileRequiredRoutes.some((route) => path.startsWith(route))
  ) {
    return NextResponse.redirect(new URL(`/onboarding`, request.url));
  }

  // If no profile exists and not on onboarding, redirect to onboarding
  if (profileExists && path.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL(`/dashboard`, request.url));
  }

  // Allow access to protected routes
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
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
