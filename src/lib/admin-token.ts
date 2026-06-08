import { cookies } from "next/headers";

import { ADMIN_COOKIE, signToken, verifyToken } from "@/lib/auth/token";

export { ADMIN_COOKIE };

const ADMIN_TTL = 60 * 60 * 8; // 8 horas

function getAdminPassword(): string {
  const p =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "oceanblvd" : "");
  if (!p) {
    throw new Error("ADMIN_PASSWORD no está definido (obligatorio en producción).");
  }
  return p;
}

/** Comparación en tiempo constante de la contraseña de administrador. */
export function checkAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (input.length !== expected.length) return false;
  let r = 0;
  for (let i = 0; i < input.length; i++)
    r |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return r === 0;
}

/** Token de sesión de admin firmado y con expiración. */
export function createAdminToken(): Promise<string> {
  return signToken({ role: "admin" }, ADMIN_TTL);
}

export async function isAdminToken(token?: string): Promise<boolean> {
  if (!token) return false;
  const payload = await verifyToken(token);
  return Boolean(payload && payload.role === "admin");
}

/** ¿La petición actual está autenticada como admin? (server actions / páginas) */
export async function isAdminRequest(): Promise<boolean> {
  return isAdminToken(cookies().get(ADMIN_COOKIE)?.value);
}

/** Lanza si la petición no es de un admin autenticado. Usar en TODA mutación. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminRequest())) {
    throw new Error("No autorizado.");
  }
}
