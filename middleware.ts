import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "lc_session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  let role: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET ?? ""));
      role = payload.role as string;
    } catch {
      role = null;
    }
  }

  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname + req.nextUrl.search)}`, req.url);

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(loginUrl);
  }
  const needsLogin = ["/cuenta", "/tus-recetas", "/recetas/nueva", "/blog/nuevo", "/pago"].some((p) => pathname.startsWith(p)) || pathname.endsWith("/editar");
  if (needsLogin && !role) {
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*", "/tus-recetas/:path*", "/recetas/nueva", "/recetas/:slug/editar", "/blog/nuevo", "/blog/:slug/editar", "/pago/:path*"],
};
