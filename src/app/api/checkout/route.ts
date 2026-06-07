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
      // Ignoramos productos inexistentes o agotados y limitamos al stock real.
      if (!record || record.stock <= 0) continue;
      const quantity = Math.max(1, Math.min(item.quantity, record.stock));
      subtotalCents += record.priceCents * quantity;
      orderItems.push({
        recordId: record.id,
        quantity,
        unitPriceCents: record.priceCents,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "Los productos del carrito están agotados o no son válidos." },
        { status: 400 }
      );
    }

    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;

    // Pago simulado: creamos el pedido y actualizamos inventario y ventas
    // de forma atómica (transacción).
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          ...customer,
          subtotalCents,
          shippingCents,
          totalCents,
          status: "PENDING",
          items: { create: orderItems },
        },
      });
      for (const oi of orderItems) {
        await tx.record.update({
          where: { id: oi.recordId },
          data: {
            stock: { decrement: oi.quantity },
            salesCount: { increment: oi.quantity },
          },
        });
      }
      return created;
    });

    return NextResponse.json({ orderId: order.id });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar el pedido. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
