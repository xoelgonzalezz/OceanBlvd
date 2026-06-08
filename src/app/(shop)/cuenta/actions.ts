"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createUserSession, clearUserSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

export interface AuthState {
  error?: string;
}

function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

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
    },
  });

  await sendWelcomeEmail(user.email, user.name);
  await createUserSession(user.id);
  redirect("/cuenta");
}

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

  await createUserSession(user.id);
  redirect("/cuenta");
}

export async function logoutAction() {
  clearUserSession();
  redirect("/");
}
