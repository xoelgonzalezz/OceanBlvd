import Link from "next/link";
import type { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getLocale } from "@/i18n/server";
import { jsonLd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvemos las dudas más habituales sobre pedidos, envíos, estado de los discos y devoluciones en Ocean Blvd Vinyl.",
  alternates: { canonical: "/faq" },
};

const FAQS_ES = [
  { q: "¿Qué significan los estados (Mint, VG+, etc.)?", a: "Usamos el estándar internacional Goldmine para clasificar los discos de segunda mano. Mint (M) es perfecto o precintado; Near Mint (NM) casi perfecto; Very Good Plus (VG+) tiene pequeñas marcas superficiales que no afectan a la reproducción; Very Good (VG) muestra más uso y algo de ruido de fondo. Los discos nuevos siempre llegan precintados." },
  { q: "¿Cuánto tarda el envío?", a: "Los pedidos se preparan en 24 horas laborables y se entregan normalmente en 24–48h dentro de la península. El envío es gratuito a partir de 60 € y cuesta 4,99 € por debajo de ese importe." },
  { q: "¿Los vinilos de segunda mano están garantizados?", a: "Sí. Revisamos y escuchamos cada disco usado antes de ponerlo a la venta, y describimos su estado con honestidad. Si al recibirlo no se corresponde con lo indicado, te lo cambiamos o te devolvemos el dinero." },
  { q: "¿Puedo devolver un disco?", a: "Dispones de 15 días para devolver cualquier disco que no esté precintado, siempre que conserve su estado original. Los gastos de devolución corren por tu cuenta salvo que el error sea nuestro." },
  { q: "¿Cómo embaláis los discos?", a: "Con mucho mimo: fundas internas antiestáticas cuando hace falta y embalaje rígido específico para vinilos, para que lleguen impecables." },
  { q: "¿Compráis colecciones de segunda mano?", a: "¡Sí! Si quieres vender tu colección, escríbenos desde la página de contacto contándonos qué tienes y te haremos una valoración sin compromiso." },
  { q: "¿El pago es seguro?", a: "Sí. Los pagos se procesan de forma segura con tarjeta a través de Stripe, con cifrado de extremo a extremo. Nunca almacenamos los datos de tu tarjeta." },
];

const FAQS_EN = [
  { q: "What do the grades (Mint, VG+, etc.) mean?", a: "We use the international Goldmine standard to grade second-hand records. Mint (M) is perfect or sealed; Near Mint (NM) almost perfect; Very Good Plus (VG+) has light surface marks that don't affect playback; Very Good (VG) shows more wear and some background noise. New records always arrive sealed." },
  { q: "How long does shipping take?", a: "Orders are prepared within 24 working hours and usually delivered in 24–48h within mainland Spain. Shipping is free over €60 and costs €4.99 below that amount." },
  { q: "Are second-hand records guaranteed?", a: "Yes. We check and listen to every used record before listing it, and describe its condition honestly. If it doesn't match the description on arrival, we'll exchange it or refund you." },
  { q: "Can I return a record?", a: "You have 15 days to return any unsealed record, provided it keeps its original condition. Return shipping is on you unless the mistake is ours." },
  { q: "How do you pack the records?", a: "With great care: antistatic inner sleeves when needed and rigid vinyl-specific packaging, so they arrive flawless." },
  { q: "Do you buy second-hand collections?", a: "Yes! If you'd like to sell your collection, write to us from the contact page telling us what you have and we'll give you a no-obligation valuation." },
  { q: "Is payment secure?", a: "Yes. Payments are processed securely by card through Stripe, with end-to-end encryption. We never store your card details." },
];

export default function FaqPage() {
  const locale = getLocale();
  const faqs = locale === "en" ? FAQS_EN : FAQS_ES;
  const tx =
    locale === "en"
      ? {
          eyebrow: "Help",
          title: "Frequently asked questions",
          desc: "Everything you need to know before and after your purchase.",
          cta: "Can't find your answer?",
          write: "Write to us",
          help: "and we'll help.",
        }
      : {
          eyebrow: "Ayuda",
          title: "Preguntas frecuentes",
          desc: "Todo lo que necesitas saber antes y después de tu compra.",
          cta: "¿No encuentras tu respuesta?",
          write: "Escríbenos",
          help: "y te ayudamos.",
        };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="container max-w-3xl py-10 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }}
      />
      <header className="max-w-2xl">
        <span className="section-eyebrow">{tx.eyebrow}</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          {tx.title}
        </h1>
        <p className="mt-3 text-muted-foreground">{tx.desc}</p>
      </header>

      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border bg-secondary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {tx.cta}{" "}
          <Link href="/contacto" className="font-medium text-primary hover:underline">
            {tx.write}
          </Link>{" "}
          {tx.help}
        </p>
      </div>
    </div>
  );
}
