import { NextResponse } from "next/server";

import { getOrderForConfirmation } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { generateReceiptPdf } from "@/lib/receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Descarga del recibo en PDF. Mismo control de acceso que la confirmación:
 * solo si coincide el token (`?t=`) o si el pedido es del usuario en sesión.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = new URL(req.url).searchParams.get("t") ?? undefined;
  const user = await getCurrentUser();
  const order = await getOrderForConfirmation(params.id, token, user?.id);

  if (!order) {
    return new NextResponse("No autorizado", { status: 404 });
  }

  const pdf = await generateReceiptPdf(order);
  const ref = order.id.slice(-8).toUpperCase();

  // `pdf` es un Buffer de Node; en runtime es un body válido. El cast evita la
  // fricción de tipos Buffer/BodyInit en la lib de TS.
  return new NextResponse(pdf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-OBV-${ref}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
