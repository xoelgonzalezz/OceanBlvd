import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { calcShipping } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revisa los datos del formulario.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, ...customer } = parsed.data;
    const ids = items.map((i) => i.id);
    const records = await db.record.findMany({ where: { id: { in: ids } } });
    const byId = new Map(records.map((r) => [r.id, r]));

    // Calculamos los totales SIEMPRE en el servidor (no confiamos en el cliente).
    let subtotalCents = 0;
    const orderItems: {
      recordId: string;
      quantity: number;
      unitPriceCents: number;
    }[] = [];

    for (const item of items) {
      const record = byId.get(item.id);
      if (!record) continue;
      const quantity = Math.max(1, item.quantity);
      subtotalCents += record.priceCents * quantity;
      orderItems.push({
        recordId: record.id,
        quantity,
        unitPriceCents: record.priceCents,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No hay productos válidos en el carrito." },
        { status: 400 }
      );
    }

    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;

    // Pago simulado: creamos el pedido como PENDING.
    const order = await db.order.create({
      data: {
        ...customer,
        subtotalCents,
        shippingCents,
        totalCents,
        status: "PENDING",
        items: { create: orderItems },
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar el pedido. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
