import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/app/site-config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // refreshing the auth token
  const user = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === siteConfig.auth.loginUrl;
  const isProtectedPage = request.nextUrl.pathname.startsWith("/p");

  // Redirect to dashboard if accessing login while authenticated
  if (!user.error && isLoginPage) {
    return NextResponse.redirect(
      new URL(siteConfig.auth.callbackUrl, request.url)
    );
  }

  // Redirect to login if trying to access protected routes without auth
  if (user.error && isProtectedPage) {
    return NextResponse.redirect(
      new URL(siteConfig.auth.loginUrl, request.url)
    );
  }

  return supabaseResponse;
}
