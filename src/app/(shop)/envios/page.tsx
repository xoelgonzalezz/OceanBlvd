import type { Metadata } from "next";
import { Truck, Package, RotateCcw, Globe } from "lucide-react";

import { getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Envíos y devoluciones",
  description:
    "Información sobre plazos, costes de envío y política de devoluciones de Ocean Blvd Vinyl.",
  alternates: { canonical: "/envios" },
};

const CONTENT = {
  es: {
    eyebrow: "Información",
    title: "Envíos y devoluciones",
    desc: "Queremos que tus discos lleguen rápido, seguros e impecables.",
    highlights: [
      { icon: Truck, title: "Envío 24–48h", text: "En la península, una vez preparado el pedido." },
      { icon: Package, title: "Gratis desde 60 €", text: "Por debajo, 4,99 € de envío estándar." },
      { icon: RotateCcw, title: "15 días", text: "Para devoluciones de discos sin precintar." },
      { icon: Globe, title: "Envío internacional", text: "Consúltanos para envíos fuera de España." },
    ],
    sections: [
      { h: "Plazos y costes de envío", p: ["Preparamos todos los pedidos en un plazo de 24 horas laborables. El tiempo de entrega habitual es de 24 a 48 horas en la península. Para Baleares, Canarias, Ceuta y Melilla los plazos pueden variar ligeramente.", "El envío es gratuito a partir de 60 €. Para importes inferiores, aplicamos una tarifa plana de 4,99 € que verás siempre claramente antes de confirmar el pedido."] },
      { h: "Embalaje", p: ["Cada disco viaja protegido con embalaje rígido específico para vinilos. Cuando es necesario, sustituimos o añadimos fundas internas antiestáticas para garantizar que tus discos lleguen en perfecto estado."] },
      { h: "Devoluciones", p: ["Dispones de 15 días desde la recepción para devolver cualquier disco que no esté precintado, siempre que conserve su estado original. Si la devolución se debe a un error nuestro o a un disco que no se corresponde con la descripción, asumimos los gastos y te ofrecemos cambio o reembolso completo.", "Para iniciar una devolución, escríbenos desde la página de contacto indicando tu número de pedido y te guiaremos en el proceso."] },
      { h: "Seguimiento", p: ["En cuanto tu pedido salga de nuestro almacén recibirás un correo con la confirmación de envío y, si el transportista lo permite, un número de seguimiento."] },
    ],
  },
  en: {
    eyebrow: "Information",
    title: "Shipping & returns",
    desc: "We want your records to arrive fast, safe and flawless.",
    highlights: [
      { icon: Truck, title: "24–48h shipping", text: "Within mainland Spain, once the order is prepared." },
      { icon: Package, title: "Free over €60", text: "Below that, €4.99 standard shipping." },
      { icon: RotateCcw, title: "15 days", text: "To return unsealed records." },
      { icon: Globe, title: "International shipping", text: "Ask us about shipping outside Spain." },
    ],
    sections: [
      { h: "Delivery times and costs", p: ["We prepare every order within 24 working hours. Typical delivery time is 24 to 48 hours within mainland Spain. For the Balearic and Canary Islands, Ceuta and Melilla, times may vary slightly.", "Shipping is free over €60. Below that, we apply a flat €4.99 fee that you'll always see clearly before confirming your order."] },
      { h: "Packaging", p: ["Every record travels protected in rigid vinyl-specific packaging. When needed, we replace or add antistatic inner sleeves to guarantee your records arrive in perfect condition."] },
      { h: "Returns", p: ["You have 15 days from delivery to return any unsealed record, provided it keeps its original condition. If the return is due to our mistake or a record that doesn't match the description, we cover the costs and offer an exchange or full refund.", "To start a return, write to us from the contact page with your order number and we'll guide you through the process."] },
      { h: "Tracking", p: ["As soon as your order leaves our warehouse you'll receive a shipping confirmation email and, where the carrier allows, a tracking number."] },
    ],
  },
};

export default function EnviosPage() {
  const locale = getLocale();
  const c = CONTENT[locale === "en" ? "en" : "es"];

  return (
    <div className="container max-w-3xl py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">{c.eyebrow}</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{c.desc}</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {c.highlights.map((h) => (
          <div key={h.title} className="rounded-lg border bg-card p-4">
            <h.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{h.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{h.text}</p>
          </div>
        ))}
      </div>

      <div className="prose-editorial mt-10 max-w-none">
        {c.sections.map((s) => (
          <div key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
