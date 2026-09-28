import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate for the admin area: only checks that a session cookie exists.
// The real session validation happens in requireUser() on every page and action.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has("vh_session")) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
