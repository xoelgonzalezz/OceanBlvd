import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

/** Marca un pedido como pagado y descuenta stock (idempotente). */
async function markOrderPaid(orderId: string) {
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.status === "PAID") return; // ya procesado
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });
    for (const oi of order.items) {
      await tx.record.update({
        where: { id: oi.recordId },
        data: {
          stock: { decrement: oi.quantity },
          salesCount: { increment: oi.quantity },
        },
      });
    }
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Falta la firma." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch {
    return NextResponse.json({ error: "Firma no válida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      try {
        await markOrderPaid(orderId);
      } catch {
        return NextResponse.json({ error: "Error al actualizar el pedido." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
