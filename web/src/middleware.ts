import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
// import { getUserProfile } from "@/services/user.service";

// Public routes that are accessible to everyone
const publicRoutes = ["/about", "/terms", "/privacy", "/"];

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

  // Only fetch user profile if authenticated
  let profileExists = false;
  try {
    const profileResponse = await fetch(
      new URL("/api/users/me", request.url).toString(),
      {
        headers: {
          // Forward necessary cookies for authentication
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      profileExists = !!profileData && Object.keys(profileData).length > 0;
    } else {
      console.error("Failed to fetch user profile:", profileResponse.status);
    }
  } catch (error) {
    console.error("Error fetching user profile in middleware:", error);
  }

  // Handle authenticated user navigation based on profile existence
  if (path === "/") {
    if (profileExists) {
      return NextResponse.redirect(new URL(`/dashboard`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/onboarding`, request.url));
    }
  }

  // If the route is in the profileRequiredRoutes array and no profile exists, redirect to onboarding
  if (
    !profileExists &&
    profileRequiredRoutes.some((route) => path.startsWith(route))
  ) {
    return NextResponse.redirect(new URL(`/onboarding`, request.url));
  }

  // If profile exists and on onboarding, redirect to dashboard
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
