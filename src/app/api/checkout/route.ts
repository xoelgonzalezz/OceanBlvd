import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { TAGS } from "@/lib/queries";
import { sendOrderConfirmation } from "@/lib/email";
import { checkoutSchema } from "@/lib/validators";
import { calcShipping, SITE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { stripe, stripeEnabled } from "@/lib/stripe";

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
    const records = await db.record.findMany({
      where: { id: { in: ids } },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    });
    const byId = new Map(records.map((r) => [r.id, r]));

    // Totales SIEMPRE en el servidor (no confiamos en el cliente).
    let subtotalCents = 0;
    const orderItems: { recordId: string; quantity: number; unitPriceCents: number }[] = [];

    for (const item of items) {
      const record = byId.get(item.id);
      if (!record || record.stock <= 0) continue;
      const quantity = Math.max(1, Math.min(item.quantity, record.stock));
      subtotalCents += record.priceCents * quantity;
      orderItems.push({ recordId: record.id, quantity, unitPriceCents: record.priceCents });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "Los productos del carrito están agotados o no son válidos." },
        { status: 400 }
      );
    }

    const shippingCents = calcShipping(subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    const user = await getCurrentUser();

    /* ---------- Pago REAL con Stripe ---------- */
    if (stripeEnabled && stripe) {
      // Pedido PENDING; el stock se descuenta al confirmar el pago (webhook).
      const order = await db.order.create({
        data: {
          ...customer,
          subtotalCents,
          shippingCents,
          totalCents,
          status: "PENDING",
          userId: user?.id ?? null,
          items: { create: orderItems },
        },
      });

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = orderItems.map(
        (oi) => {
          const record = byId.get(oi.recordId)!;
          const raw = record.images[0]?.url;
          const abs = raw
            ? raw.startsWith("http")
              ? raw
              : new URL(raw, SITE.url).toString()
            : undefined;
          return {
            quantity: oi.quantity,
            price_data: {
              currency: "eur",
              unit_amount: oi.unitPriceCents,
              product_data: {
                name: record.title,
                images: abs && abs.startsWith("https://") ? [abs] : undefined,
              },
            },
          };
        }
      );

      if (shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: shippingCents,
            product_data: { name: "Envío" },
          },
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: customer.email,
        success_url: `${SITE.url}/checkout/exito?order=${order.id}&t=${order.accessToken ?? ""}`,
        cancel_url: `${SITE.url}/checkout?cancelado=1`,
        metadata: { orderId: order.id },
      });

      return NextResponse.json({ url: session.url });
    }

    /* ---------- Pago SIMULADO (sin Stripe) ---------- */
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          ...customer,
          subtotalCents,
          shippingCents,
          totalCents,
          status: "PAID",
          userId: user?.id ?? null,
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

    revalidateTag(TAGS.records); // el stock/ventas han cambiado
    await sendOrderConfirmation(order.id); // email de confirmación
    return NextResponse.json({ orderId: order.id, token: order.accessToken });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar el pedido. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
