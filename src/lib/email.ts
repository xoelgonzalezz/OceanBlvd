import nodemailer from "nodemailer";

import { SITE, correosTrackingUrl } from "@/lib/constants";
import { getOrderById } from "@/lib/queries";
import { generateReceiptPdf } from "@/lib/receipt";

interface MailAttachment {
  filename: string;
  content: Buffer;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Ocean Blvd Vinyl <onboarding@resend.dev>";
// Dirección del DUEÑO: recibe aviso de cada pedido y de cada mensaje de contacto.
const OWNER_EMAIL = process.env.OWNER_EMAIL;

// SMTP (p. ej. Gmail con contraseña de aplicación): envía a CUALQUIER destinatario.
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const smtpEnabled = Boolean(SMTP_USER && SMTP_PASS);

export const emailEnabled = Boolean(smtpEnabled || RESEND_API_KEY);

let transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter | null {
  if (!smtpEnabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Envía un correo. Prioridad: SMTP (Gmail) -> Resend -> nada.
 * No lanza: nunca bloquea el flujo de la app.
 */
async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: MailAttachment[]
): Promise<void> {
  if (!to) return;

  const tx = getTransporter();
  if (tx) {
    try {
      await tx.sendMail({ from: EMAIL_FROM, to, subject, html, attachments });
    } catch {
      /* no bloquea */
    }
    return;
  }

  if (RESEND_API_KEY) {
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
          subject,
          html,
          attachments: attachments?.map((a) => ({
            filename: a.filename,
            content: a.content.toString("base64"),
          })),
        }),
      });
    } catch {
      /* no bloquea */
    }
  }
}

function abs(url: string): string {
  return url.startsWith("http") ? url : `${SITE.url}${url}`;
}

function eur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

/** Escapa texto del usuario antes de meterlo en el HTML del correo. */
function esc(s: string): string {
  return String(s ?? "").replace(/[<>&"]/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : "&quot;"
  );
}

/**
 * Carcasa común de los correos: cabecera negra con wordmark + collage A COLOR
 * de portadas reales, cuerpo en blanco y negro y pie negro. (Estilo híbrido.)
 */
function emailShell(subtitle: string, body: string): string {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f1e8;padding:24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e8;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:92%;background:#ffffff;border:1px solid #e7e5e0;overflow:hidden;">
        <tr><td style="background:#0f0f0f;padding:24px 32px;">
          <div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:22px;letter-spacing:0.5px;">Ocean Blvd <span style="color:#bdb8ad;">Vinyl</span></div>
          <div style="font-family:Helvetica,Arial,sans-serif;color:#bdb8ad;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;">${subtitle}</div>
        </td></tr>
        <tr><td style="font-size:0;line-height:0;">
          <img src="${SITE.url}/email/collage-banner.jpg" width="560" alt="Ocean Blvd Vinyl" style="display:block;width:100%;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="background:#0f0f0f;padding:22px 32px;">
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
          <div style="font-weight:600;color:#0f0f0f;font-size:14px;">${esc(item.record.title)}</div>
          <div style="color:#6b6760;font-size:12px;">${esc(item.record.artist.name)} · x${item.quantity}</div>
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

  return emailShell(
    "Confirmación de pedido",
    `<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Gracias por tu pedido, ${esc(order.fullName.split(" ")[0])}.</h1>
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
         ${esc(order.fullName)}<br>${esc(order.address)}<br>${esc(order.postalCode)} ${esc(order.city)}<br>${esc(order.country)}
       </div>
     </div>
     <div style="margin-top:28px;">
       <a href="${SITE.url}/checkout/exito?order=${order.id}&t=${order.accessToken ?? ""}" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Ver mi pedido</a>
     </div>`
  );
}

/** Plantilla del email de bienvenida — mismo estilo blanco y negro. */
export function welcomeHtml(name: string): string {
  const first = (name || "").split(" ")[0] || "hola";
  return emailShell(
    "Bienvenido",
    `<h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Bienvenido, ${esc(first)}.</h1>
     <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.7;">
       Gracias por crear tu cuenta en Ocean Blvd Vinyl. Aquí encontrarás novedades, ediciones especiales y joyas de segunda mano cuidadosamente seleccionadas.
     </p>
     <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.7;">
       Desde tu cuenta podrás seguir tus pedidos y comprar más rápido. ¿Empezamos?
     </p>
     <a href="${SITE.url}/tienda" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Explorar el catálogo</a>`
  );
}

/** Envía el email de bienvenida al registrarse (no hace nada sin RESEND_API_KEY). */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendMail(to, "Bienvenido a Ocean Blvd Vinyl", welcomeHtml(name));
}

/** Email con el código de verificación (OTP). */
export function verificationHtml(name: string, code: string): string {
  const first = (name || "").split(" ")[0] || "hola";
  return emailShell(
    "Verifica tu cuenta",
    `<div style="text-align:center;">
       <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:23px;color:#0f0f0f;">Hola, ${esc(first)}.</h1>
       <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.7;">
         Tu código de verificación para Ocean Blvd Vinyl es:
       </p>
       <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;letter-spacing:12px;color:#0f0f0f;background:#f5f1e8;border:1px solid #e7e5e0;border-radius:6px;padding:18px 0;">${code}</div>
       <p style="margin:24px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9b958a;line-height:1.6;">
         El código caduca en 15 minutos. Si no has creado ninguna cuenta, ignora este correo.
       </p>
     </div>`
  );
}

/** Envía el código de verificación (no hace nada sin RESEND_API_KEY). */
export async function sendVerificationCode(
  to: string,
  name: string,
  code: string
): Promise<void> {
  await sendMail(
    to,
    `Tu código de Ocean Blvd Vinyl: ${code}`,
    verificationHtml(name, code)
  );
}

/** Envía el email de confirmación (no hace nada si RESEND_API_KEY no está configurada). */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) return;

  // Adjunta el recibo en PDF. Si fallara su generación, el correo sale igual.
  let attachments: MailAttachment[] | undefined;
  try {
    const pdf = await generateReceiptPdf(order);
    attachments = [
      { filename: `recibo-OBV-${order.id.slice(-8).toUpperCase()}.pdf`, content: pdf },
    ];
  } catch {
    attachments = undefined;
  }

  await sendMail(
    order.email,
    `Tu pedido en Ocean Blvd Vinyl — #${order.id.slice(-8).toUpperCase()}`,
    orderConfirmationHtml(order),
    attachments
  );
}

/** Email de "pedido enviado" con el localizador y el enlace de Correos. */
export function shippingHtml(order: OrderFull): string {
  const ref = order.id.slice(-8).toUpperCase();
  const first = order.fullName.split(" ")[0];
  const carrier = order.carrier ?? "Correos";
  const tracking = order.trackingNumber ?? "";
  const trackUrl = correosTrackingUrl(tracking);

  return emailShell(
    "Tu pedido va de camino",
    `<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">¡Tu pedido va de camino, ${esc(first)}!</h1>
     <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;line-height:1.6;">
       Hemos enviado tu pedido <strong style="color:#0f0f0f;">#${ref}</strong> por <strong style="color:#0f0f0f;">${esc(carrier)}</strong>. Aquí tienes tu número de seguimiento:
     </p>
     <div style="border:1px solid #e7e5e0;border-radius:6px;padding:18px 20px;text-align:center;">
       <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9b958a;">Nº de seguimiento</div>
       <div style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#0f0f0f;letter-spacing:1px;margin-top:6px;">${esc(tracking)}</div>
     </div>
     <div style="margin-top:22px;text-align:center;">
       <a href="${trackUrl}" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Seguir mi envío</a>
     </div>
     <p style="margin:22px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#9b958a;line-height:1.6;">
       El seguimiento puede tardar unas horas en mostrar el primer movimiento. Si el botón no funciona, entra en <a href="https://www.correos.es/es/es/herramientas/localizador/envios" style="color:#0f0f0f;">correos.es</a> y pega el número de arriba.
     </p>
     <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e7e5e0;">
       <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9b958a;margin-bottom:8px;">Envío a</div>
       <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;line-height:1.6;">
         ${esc(order.fullName)}<br>${esc(order.address)}<br>${esc(order.postalCode)} ${esc(order.city)}<br>${esc(order.country)}
       </div>
     </div>`
  );
}

export async function sendShippingNotification(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order || !order.trackingNumber) return;
  await sendMail(
    order.email,
    `Tu pedido va de camino — #${order.id.slice(-8).toUpperCase()}`,
    shippingHtml(order)
  );
}

/* ---------- Avisos al DUEÑO de la tienda ---------- */

/** Avisa al dueño (OWNER_EMAIL) de un pedido nuevo, con todo para gestionarlo. */
export async function sendOwnerOrderNotification(orderId: string): Promise<void> {
  if (!OWNER_EMAIL) return;
  const order = await getOrderById(orderId);
  if (!order) return;
  const ref = order.id.slice(-8).toUpperCase();
  const items = order.items
    .map(
      (i) =>
        `<li style="margin-bottom:4px;">${esc(i.record.title)} — ${esc(
          i.record.artist.name
        )} · x${i.quantity}</li>`
    )
    .join("");
  const html = emailShell(
    "Nuevo pedido",
    `<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Nuevo pedido #${ref}</h1>
     <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#6b6760;">Total: <strong style="color:#0f0f0f;">${eur(
       order.totalCents
     )}</strong> · Envío: ${order.shippingCents === 0 ? "Gratis" : eur(order.shippingCents)}</p>
     <ul style="margin:0 0 16px;padding-left:18px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;">${items}</ul>
     <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;line-height:1.6;">
       <strong>Enviar a</strong><br>${esc(order.fullName)}<br>${esc(order.address)}<br>${esc(
       order.postalCode
     )} ${esc(order.city)}<br>${esc(order.country)}<br>${esc(order.email)}${
       order.phone ? ` · ${esc(order.phone)}` : ""
     }
     </div>
     <div style="margin-top:24px;">
       <a href="${SITE.url}/admin/pedidos" style="display:inline-block;background:#0f0f0f;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:4px;">Gestionar el pedido</a>
     </div>`
  );
  await sendMail(OWNER_EMAIL, `🛒 Nuevo pedido #${ref} — ${eur(order.totalCents)}`, html);
}

/** Avisa al dueño (OWNER_EMAIL) de un mensaje del formulario de contacto. */
export async function sendOwnerContactNotification(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (!OWNER_EMAIL) return;
  const html = emailShell(
    "Nuevo mensaje de contacto",
    `<h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#0f0f0f;">Nuevo mensaje de contacto</h1>
     <p style="margin:0 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;"><strong>${esc(
       msg.name
     )}</strong> &lt;${esc(msg.email)}&gt;</p>
     <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#6b6760;">Asunto: ${esc(
       msg.subject
     )}</p>
     <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f0f0f;line-height:1.6;white-space:pre-wrap;">${esc(
       msg.message
     )}</p>`
  );
  await sendMail(OWNER_EMAIL, `✉️ Contacto: ${esc(msg.subject)}`, html);
}
