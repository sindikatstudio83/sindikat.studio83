import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/profil", "/firma", "/admin"];
const ROLE_HOMES: Record<string, string> = {
  candidate: "/profil",
  company: "/firma",
  admin: "/admin"
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Provjeri pristup na osnovu prefeksa rute
  const role = session.user.user_metadata?.role as string | undefined;

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_HOMES[role || ""] || "/login", request.url));
  }

  if (pathname.startsWith("/firma") && role !== "company" && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_HOMES[role || ""] || "/login", request.url));
  }

  if (pathname.startsWith("/profil") && role !== "candidate" && role !== "admin") {
    return NextResponse.redirect(new URL(ROLE_HOMES[role || ""] || "/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/profil/:path*", "/firma/:path*", "/admin/:path*"]
};
