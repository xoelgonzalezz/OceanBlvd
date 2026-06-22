import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { sendOwnerContactNotification } from "@/lib/email";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`contact:${ipFromRequest(request)}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Demasiados envíos. Espera un minuto e inténtalo de nuevo." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revisa el formulario.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await db.contactMessage.create({ data: parsed.data });
    await sendOwnerContactNotification(parsed.data); // aviso al dueño

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
