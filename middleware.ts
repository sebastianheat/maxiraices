import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/session";

// Rutas públicas (no requieren sesión de usuario).
// /api/cron se protege aparte con CRON_SECRET dentro del handler.
const PUBLICAS = ["/login", "/api/auth/login", "/api/cron"];

// Rutas solo para administradores.
const SOLO_ADMIN = ["/equipo", "/api/usuarios"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLICAS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET;
  const user = token && secret ? await verifyToken(token, secret) : null;

  if (!user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  const requiereAdmin = SOLO_ADMIN.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (requiereAdmin && user.rol !== "admin") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Aplica a todo salvo estáticos de Next y favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
