import { NextRequest, NextResponse } from "next/server";
import type { AuthUser } from "./lib/types";

function getSessionFromCookie(req: NextRequest): AuthUser | null {
  const token = req.cookies.get("inv_session")?.value;
  if (!token) return null;
  try {
    // Decode base64url: restore +, / and add padding
    const std = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = std.padEnd(std.length + (4 - std.length % 4) % 4, "=");
    return JSON.parse(atob(padded)) as AuthUser;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = getSessionFromCookie(req);

  // Protect all /admin/* sub-pages (not /admin login page itself)
  if (pathname.startsWith("/admin/")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Protect all /kelas/* pages
  if (pathname.startsWith("/kelas/")) {
    if (!user || user.role !== "kelas") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path+", "/kelas/:path*"],
};
