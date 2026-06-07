import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
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
