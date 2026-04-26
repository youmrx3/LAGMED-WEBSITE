import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Only apply auth/session logic to API routes and admin pages
  if (
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/admin")
  ) {
    return;
  }

  try {
    return await updateSession(request);
  } catch (error) {
    // If proxy auth check fails, allow request to continue.
    console.error("Proxy error:", error);
    return;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
