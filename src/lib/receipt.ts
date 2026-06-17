import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { getOrderById } from "@/lib/queries";

type OrderFull = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

const eur = (cents: number) =>
  `${(cents / 100).toFixed(2).replace(".", ",")} €`;

/**
 * Genera el PDF del RECIBO de un pedido (comprobante de compra, NO factura
 * fiscal). Diseño sobrio en blanco y negro, sin desglose de IVA.
 */
export async function generateReceiptPdf(order: OrderFull): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const ink = rgb(0.06, 0.06, 0.06);
  const grey = rgb(0.42, 0.4, 0.38);
  const line = rgb(0.9, 0.89, 0.87);

  const M = 56;
  const W = 595.28;
  const right = W - M;
  let y = 841.89 - M;

  const text = (
    s: string,
    x: number,
    size: number,
    f = font,
    color = ink
  ) => page.drawText(s, { x, y, size, font: f, color });

  const textRight = (
    s: string,
    xRight: number,
    size: number,
    f = font,
    color = ink
  ) =>
    page.drawText(s, {
      x: xRight - f.widthOfTextAtSize(s, size),
      y,
      size,
      font: f,
      color,
    });

  const hr = () => {
    page.drawLine({
      start: { x: M, y: y },
      end: { x: right, y: y },
      thickness: 1,
      color: line,
    });
  };

  // Cabecera
  text("OCEAN BLVD VINYL", M, 20, bold);
  y -= 16;
  text("Tienda de vinilos · oceanblvdvinyl.com", M, 10, font, grey);

  // Título
  y -= 40;
  text("Recibo de compra", M, 16, bold);

  // Metadatos
  const ref = `OBV-${order.id.slice(-8).toUpperCase()}`;
  const date = new Date(order.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  y -= 26;
  text("Recibo nº:", M, 10, font, grey);
  text(ref, M + 70, 10, bold);
  y -= 16;
  text("Fecha:", M, 10, font, grey);
  text(date, M + 70, 10, font);
  y -= 16;
  text("Cliente:", M, 10, font, grey);
  text(`${order.fullName} · ${order.email}`, M + 70, 10, font);

  // Cabecera de tabla
  y -= 30;
  const qtyRight = 430;
  text("ARTÍCULO", M, 9, font, grey);
  textRight("CANT.", qtyRight, 9, font, grey);
  textRight("IMPORTE", right, 9, font, grey);
  y -= 8;
  hr();

  // Líneas
  for (const item of order.items) {
    y -= 22;
    const title = `${item.record.title} — ${item.record.artist.name}`;
    text(title.length > 58 ? `${title.slice(0, 57)}…` : title, M, 11);
    textRight(String(item.quantity), qtyRight, 11);
    textRight(eur(item.unitPriceCents * item.quantity), right, 11);
  }

  y -= 12;
  hr();

  // Totales
  const totalRow = (label: string, value: string, isBold = false) => {
    y -= 20;
    const f = isBold ? bold : font;
    textRight(label, qtyRight, isBold ? 12 : 11, f, isBold ? ink : grey);
    textRight(value, right, isBold ? 12 : 11, f);
  };
  totalRow("Subtotal", eur(order.subtotalCents));
  totalRow(
    "Envío",
    order.shippingCents === 0 ? "Gratis" : eur(order.shippingCents)
  );
  totalRow("TOTAL", eur(order.totalCents), true);

  // Dirección de envío
  y -= 40;
  text("ENVÍO A", M, 9, font, grey);
  y -= 16;
  text(order.fullName, M, 11);
  y -= 14;
  text(order.address, M, 11);
  y -= 14;
  text(`${order.postalCode} ${order.city}`, M, 11);
  y -= 14;
  text(order.country, M, 11);

  // Nota honesta (no fiscal)
  y = M + 24;
  const note =
    "Este documento es un comprobante de compra, no una factura fiscal. El precio mostrado es el precio final.";
  page.drawText(note, {
    x: M,
    y,
    size: 8.5,
    font,
    color: grey,
    maxWidth: right - M,
    lineHeight: 12,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
