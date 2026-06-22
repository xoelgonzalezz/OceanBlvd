// Recuperación de contraseña con token firmado (sin estado extra en BD).
// El token caduca a los 30 min y va ligado a una huella del hash de contraseña
// ACTUAL: en cuanto la contraseña cambia, la huella deja de coincidir, así que
// el enlace queda invalidado automáticamente (de un solo uso).

import { db } from "@/lib/db";
import { signToken, verifyToken } from "@/lib/auth/token";

const RESET_TTL_S = 30 * 60; // 30 minutos

/** Huella corta (SHA-256) del hash de contraseña actual. */
async function passwordBinding(passwordHash: string | null): Promise<string> {
  const data = new TextEncoder().encode(passwordHash ?? "");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Crea un token de restablecimiento para un usuario. */
export async function createResetToken(
  userId: string,
  passwordHash: string | null
): Promise<string> {
  return signToken(
    { uid: userId, purpose: "reset", k: await passwordBinding(passwordHash) },
    RESET_TTL_S
  );
}

/**
 * Valida un token de restablecimiento: comprueba firma, caducidad, propósito y
 * que no se haya usado ya (la huella debe coincidir con el hash actual del
 * usuario). Devuelve el id de usuario si todo es correcto, o null.
 */
export async function validateResetToken(token: string): Promise<string | null> {
  const payload = await verifyToken(token);
  if (
    !payload ||
    payload.purpose !== "reset" ||
    typeof payload.uid !== "string" ||
    typeof payload.k !== "string"
  ) {
    return null;
  }
  const user = await db.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, passwordHash: true },
  });
  if (!user) return null;
  if (payload.k !== (await passwordBinding(user.passwordHash))) return null;
  return user.id;
}
