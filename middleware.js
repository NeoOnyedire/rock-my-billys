import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/api/auth/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/avatars") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("rmb_session")?.value;
  let valid = false;
  let isAdmin = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      valid = true;
      isAdmin = payload.role === "ADMIN";
    } catch {
      valid = false;
    }
  }

  if (!valid) {
    if (pathname === "/login") return NextResponse.next();
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/matchdays") || pathname.startsWith("/api/players")) {
    if (!isAdmin) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Admins only" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|avatars).*)"],
};
