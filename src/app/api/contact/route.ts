import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revisa el formulario.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await db.contactMessage.create({ data: parsed.data });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
