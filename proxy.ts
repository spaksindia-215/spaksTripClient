import { NextResponse, type NextRequest } from "next/server";

const PARTNER_PATH_HEADER = "x-spakstrip-path";

export function proxy(request: NextRequest) {
  const hasAccessToken = Boolean(request.cookies.get("accessToken")?.value);
  const hasRefreshToken = Boolean(request.cookies.get("refreshToken")?.value);
  const redirectTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (!hasAccessToken && !hasRefreshToken) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(PARTNER_PATH_HEADER, redirectTarget);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/partner/:path*",
};
