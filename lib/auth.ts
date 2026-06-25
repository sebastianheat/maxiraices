import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken, type SessionPayload } from "./session";

// Lee y valida la sesión actual desde la cookie (server components / route handlers).
export async function getSessionUser(): Promise<SessionPayload | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token, secret);
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const user = await getSessionUser();
  if (!user || user.rol !== "admin") return null;
  return user;
}
