import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/cuenta", "/admin", "/checkout"];
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));
  if (isAdmin && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/checkout"],
};
