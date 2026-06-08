"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { randomInt } from "node:crypto";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession, clearUserSession } from "@/lib/auth/session";
import { PENDING_COOKIE, signToken, verifyToken } from "@/lib/auth/token";
import { loginSchema, registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail, sendVerificationCode } from "@/lib/email";

export interface AuthState {
  error?: string;
}

const CODE_TTL_MS = 15 * 60 * 1000; // 15 min
const PENDING_TTL_S = 30 * 60; // 30 min

function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Devuelve un destino interno seguro de `next`, o undefined. */
function rawNext(formData: FormData): string | undefined {
  const n = formData.get("next");
  return typeof n === "string" && n.startsWith("/") && !n.startsWith("//")
    ? n
    : undefined;
}

function genCode(): string {
  return String(randomInt(100000, 1000000)); // 6 dígitos
}

async function setPending(uid: string, next?: string) {
  const token = await signToken(
    { uid, purpose: "verify", next: next ?? null },
    PENDING_TTL_S
  );
  cookies().set(PENDING_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: PENDING_TTL_S,
    secure: process.env.NODE_ENV === "production",
  });
}

async function getPending(): Promise<{ uid: string; next?: string } | null> {
  const token = cookies().get(PENDING_COOKIE)?.value;
  if (!token) return null;
  const p = await verifyToken(token);
  if (!p || p.purpose !== "verify" || typeof p.uid !== "string") return null;
  const next =
    typeof p.next === "string" && p.next.startsWith("/") && !p.next.startsWith("//")
      ? p.next
      : undefined;
  return { uid: p.uid, next };
}

function clearPending() {
  cookies().delete(PENDING_COOKIE);
}

/** Genera y envía un nuevo código de verificación, y guarda la sesión pendiente. */
async function issueCode(
  user: { id: string; email: string; name: string },
  next?: string
) {
  const code = genCode();
  await db.user.update({
    where: { id: user.id },
    data: { verifyCode: code, verifyCodeExpires: new Date(Date.now() + CODE_TTL_MS) },
  });
  await sendVerificationCode(user.email, user.name, code);
  await setPending(user.id, next);
}

/* ---------- Registro (con verificación obligatoria) ---------- */

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!rateLimit(`register:${clientIp()}`, 5, 60_000)) {
    return { error: "Demasiados intentos. Espera un minuto." };
  }
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash: await hashPassword(parsed.data.password),
      verified: false,
    },
  });

  await issueCode(user, rawNext(formData));
  redirect("/verificar");
}

/* ---------- Verificación ---------- */

export async function verifyAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!rateLimit(`verify:${clientIp()}`, 10, 60_000)) {
    return { error: "Demasiados intentos. Espera un minuto." };
  }
  const pending = await getPending();
  if (!pending) {
    return { error: "Tu sesión de verificación ha caducado. Vuelve a entrar." };
  }
  const code = String(formData.get("code") || "").replace(/\D/g, "").slice(0, 6);
  if (code.length !== 6) {
    return { error: "Introduce el código de 6 dígitos." };
  }

  const user = await db.user.findUnique({ where: { id: pending.uid } });
  if (!user) return { error: "Cuenta no encontrada." };

  if (
    !user.verifyCode ||
    !user.verifyCodeExpires ||
    user.verifyCodeExpires < new Date() ||
    user.verifyCode !== code
  ) {
    return { error: "Código incorrecto o caducado." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { verified: true, verifyCode: null, verifyCodeExpires: null },
  });
  await sendWelcomeEmail(user.email, user.name);
  clearPending();
  await createUserSession(user.id);
  redirect(pending.next ?? "/cuenta");
}

export async function resendCodeAction(): Promise<void> {
  if (!rateLimit(`verify-resend:${clientIp()}`, 3, 60_000)) {
    redirect("/verificar?error=wait");
  }
  const pending = await getPending();
  if (!pending) redirect("/acceso");
  const user = await db.user.findUnique({ where: { id: pending!.uid } });
  if (!user) redirect("/acceso");
  await issueCode(user!, pending!.next);
  redirect("/verificar?resent=1");
}

/* ---------- Acceso ---------- */

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!rateLimit(`login:${clientIp()}`, 10, 60_000)) {
    return { error: "Demasiados intentos. Espera un minuto." };
  }
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Correo o contraseña incorrectos." };
  if (!user.passwordHash) {
    return { error: "Esta cuenta usa el acceso con Google. Entra con Google." };
  }
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  // Verificación obligatoria: si no ha verificado, lo mandamos a verificar.
  if (!user.verified) {
    await issueCode(user, rawNext(formData));
    redirect("/verificar");
  }

  await createUserSession(user.id);
  redirect(rawNext(formData) ?? "/cuenta");
}

export async function logoutAction() {
  clearUserSession();
  redirect("/");
}
