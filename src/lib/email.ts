import { SITE } from "@/lib/constants";
import { getOrderById } from "@/lib/queries";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Ocean Blvd Vinyl <onboarding@resend.dev>";

export const emailEnabled = Boolean(RESEND_API_KEY);

function abs(url: string): string {
  return url.startsWith("http") ? url : `${SITE.url}${url}`;
}

function eur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

type OrderFull = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

/** Plantilla HTML del email — blanco y negro editorial, como la web. */
export function orderConfirmationHtml(order: OrderFull): string {
  const ref = order.id.slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rows = order.items
    .map((item) => {
      const cover = item.record.images[0]?.url
        ? abs(item.record.images[0].url)
        : `${SITE.url}/placeholders/cover-01.svg`;
      return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e7e5e0;width:64px;">
          <img src="${cover}" width="56" height="56" alt="" style="display:block;border-radius:4px;object-fit:cover;background:#f0eee9;" />
        </td>
        <td style="padding:14px 12px;border-bottom:1px solid #e7e5e0;font-family:Helvetica,Arial,sans-serif;">
          <div style="font-weight:600;color:#0f0f0f;font-size:14px;">${item.record.title}</div>
          <div style="color:#6b6760;font-size:12px;">${item.record.artist.name} · x${item.quantity}</div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid #e7e5e0;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;white-space:nowrap;">
          ${eur(item.unitPriceCents * item.quantity)}
        </td>
      </tr>`;
    })
    .join("");

  const totalRow = (label: string, value: string, bold = false) => `
    <tr>
      <td colspan="2" style="padding:6px 0;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:${bold ? "16px" : "13px"};color:${bold ? "#0f0f0f" : "#6b6760"};${bold ? "font-weight:700;" : ""}">${label}</td>
      <td style="padding:6px 0;text-align:right;font-family:Helvetica,Arial,sans-serif;font-size:${bold ? "16px" : "13px"};color:#0f0f0f;${bold ? "font-weight:700;" : ""}white-space:nowrap;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f1e8;padding:24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border:1px solid #e7e5e0;">
        <!-- Cabecera -->
        <tr><td style="background:#0f0f0f;padding:28px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:22px;letter-spacing:0.5px;">Ocean Blvd <span style="color:#bdb8ad;">Vinyl</span></div>
          <div style="font-family:Helvetica,Arial,sans-serif;color:#bdb8ad;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">Confirmación de pedido</div>
        </td></tr>
        <!-- Cuerpo -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Gracias por tu pedido, ${order.fullName.split(" ")[0]}.</h1>
          <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.6;">
            Hemos recibido tu pedido <strong style="color:#0f0f0f;">#${ref}</strong> del ${date}. Te avisaremos cuando salga hacia tu casa.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
            ${totalRow("Subtotal", eur(order.subtotalCents))}
            ${totalRow("Envío", order.shippingCents === 0 ? "Gratis" : eur(order.shippingCents))}
            ${totalRow("Total", eur(order.totalCents), true)}
          </table>

          <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e7e5e0;">
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9b958a;margin-bottom:8px;">Envío a</div>
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;line-height:1.6;">
              ${order.fullName}<br>${order.address}<br>${order.postalCode} ${order.city}<br>${order.country}
            </div>
          </div>

          <div style="margin-top:28px;">
            <a href="${SITE.url}/checkout/exito?order=${order.id}&t=${order.accessToken ?? ""}" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Ver mi pedido</a>
          </div>
        </td></tr>
        <!-- Pie -->
        <tr><td style="background:#0f0f0f;padding:24px 32px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#bdb8ad;line-height:1.6;">
            Ocean Blvd Vinyl — Hecho con cariño por la música.<br>
            <a href="${SITE.url}" style="color:#ffffff;text-decoration:underline;">${SITE.url.replace(/^https?:\/\//, "")}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Plantilla del email de bienvenida — mismo estilo blanco y negro. */
export function welcomeHtml(name: string): string {
  const first = (name || "").split(" ")[0] || "hola";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f1e8;padding:24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border:1px solid #e7e5e0;">
        <tr><td style="background:#0f0f0f;padding:28px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:22px;letter-spacing:0.5px;">Ocean Blvd <span style="color:#bdb8ad;">Vinyl</span></div>
          <div style="font-family:Helvetica,Arial,sans-serif;color:#bdb8ad;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">Bienvenido</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Bienvenido, ${first}.</h1>
          <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.7;">
            Gracias por crear tu cuenta en Ocean Blvd Vinyl. Aquí encontrarás novedades, ediciones especiales y joyas de segunda mano cuidadosamente seleccionadas.
          </p>
          <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.7;">
            Desde tu cuenta podrás seguir tus pedidos y comprar más rápido. ¿Empezamos?
          </p>
          <a href="${SITE.url}/tienda" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Explorar el catálogo</a>
        </td></tr>
        <tr><td style="background:#0f0f0f;padding:24px 32px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#bdb8ad;line-height:1.6;">
            Ocean Blvd Vinyl — Hecho con cariño por la música.<br>
            <a href="${SITE.url}" style="color:#ffffff;text-decoration:underline;">${SITE.url.replace(/^https?:\/\//, "")}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Envía el email de bienvenida al registrarse (no hace nada sin RESEND_API_KEY). */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!RESEND_API_KEY || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject: "Bienvenido a Ocean Blvd Vinyl",
        html: welcomeHtml(name),
      }),
    });
  } catch {
    // No bloqueamos el registro si el email falla.
  }
}

/** Envía el email de confirmación (no hace nada si RESEND_API_KEY no está configurada). */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  if (!RESEND_API_KEY) return;
  try {
    const order = await getOrderById(orderId);
    if (!order) return;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [order.email],
        subject: `Tu pedido en Ocean Blvd Vinyl — #${order.id.slice(-8).toUpperCase()}`,
        html: orderConfirmationHtml(order),
      }),
    });
  } catch {
    // No bloqueamos el pedido si el email falla.
  }
}
