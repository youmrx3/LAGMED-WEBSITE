import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If env vars are missing, just continue without auth middleware
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase environment variables not configured in middleware");
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Protect admin routes
      if (request.nextUrl.pathname.startsWith("/admin")) {
        if (
          !user &&
          !request.nextUrl.pathname.startsWith("/admin/login")
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/admin/login";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // If auth check fails, continue but log the error
      console.warn("Auth check failed in middleware:", error);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, just pass through to prevent site from breaking
    return NextResponse.next({ request });
  }
}
