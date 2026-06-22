import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validators";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`newsletter:${ipFromRequest(request)}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Introduce un correo válido." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();

    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo completar la suscripción." },
      { status: 500 }
    );
  }
}
