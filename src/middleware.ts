import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Only apply middleware to API routes and admin pages
  if (
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/admin")
  ) {
    return;
  }

  try {
    return await updateSession(request);
  } catch (error) {
    // If middleware fails, allow the request to continue
    // Auth will still be handled in individual components/routes
    console.error("Middleware error:", error);
    return;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
