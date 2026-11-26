import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/** Quiz sessions live at /courses/[courseId]/bankId — gated; everything else is public. */
function isQuizSessionPath(pathname: string): boolean {
  return /^\/courses\/[^/]+\/[^/]+$/.test(pathname);
}

function resolveSafeNextPath(request: NextRequest, raw: string | null, fallback: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  try {
    const origin = request.nextUrl.origin;
    const u = new URL(raw, origin);
    if (u.origin !== origin) return fallback;
    if (!u.pathname.startsWith("/")) return fallback;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return fallback;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims() verifies the JWT locally (via cached JWKS) when the project
  // uses asymmetric signing keys, avoiding a network round trip to the Auth
  // server on every request. Falls back to a getUser()-equivalent network
  // call only for symmetric-key projects.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  if (isQuizSessionPath(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set(
        "next",
        `${pathname}${search === "?" ? "" : search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const nextRaw = request.nextUrl.searchParams.get("next");
    const nextPath = resolveSafeNextPath(request, nextRaw, "/");
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return supabaseResponse;
}
