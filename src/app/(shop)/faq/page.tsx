import Link from "next/link";
import type { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvemos las dudas más habituales sobre pedidos, envíos, estado de los discos y devoluciones en Ocean Blvd Vinyl.",
};

const FAQS = [
  {
    q: "¿Qué significan los estados (Mint, VG+, etc.)?",
    a: "Usamos el estándar internacional Goldmine para clasificar los discos de segunda mano. Mint (M) es perfecto o precintado; Near Mint (NM) casi perfecto; Very Good Plus (VG+) tiene pequeñas marcas superficiales que no afectan a la reproducción; Very Good (VG) muestra más uso y algo de ruido de fondo. Los discos nuevos siempre llegan precintados.",
  },
  {
    q: "¿Cuánto tarda el envío?",
    a: "Los pedidos se preparan en 24 horas laborables y se entregan normalmente en 24–48h dentro de la península. El envío es gratuito a partir de 60 € y cuesta 4,99 € por debajo de ese importe.",
  },
  {
    q: "¿Los vinilos de segunda mano están garantizados?",
    a: "Sí. Revisamos y escuchamos cada disco usado antes de ponerlo a la venta, y describimos su estado con honestidad. Si al recibirlo no se corresponde con lo indicado, te lo cambiamos o te devolvemos el dinero.",
  },
  {
    q: "¿Puedo devolver un disco?",
    a: "Dispones de 30 días para devolver cualquier disco que no esté precintado, siempre que conserve su estado original. Los gastos de devolución corren por tu cuenta salvo que el error sea nuestro.",
  },
  {
    q: "¿Cómo embaláis los discos?",
    a: "Con mucho mimo: fundas internas antiestáticas cuando hace falta y embalaje rígido específico para vinilos, para que lleguen impecables.",
  },
  {
    q: "¿Compráis colecciones de segunda mano?",
    a: "¡Sí! Si quieres vender tu colección, escríbenos desde la página de contacto contándonos qué tienes y te haremos una valoración sin compromiso.",
  },
  {
    q: "¿El pago es seguro?",
    a: "En esta versión de demostración la pasarela de pago está simulada y no se realiza ningún cargo real. En producción se integraría una pasarela segura (como Stripe) con cifrado de extremo a extremo.",
  },
];

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">Ayuda</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Preguntas frecuentes
        </h1>
        <p className="mt-3 text-muted-foreground">
          Todo lo que necesitas saber antes y después de tu compra.
        </p>
      </header>

      <Accordion type="single" collapsible className="mt-8">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border bg-secondary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿No encuentras tu respuesta?{" "}
          <Link href="/contacto" className="font-medium text-primary hover:underline">
            Escríbenos
          </Link>{" "}
          y te ayudamos.
        </p>
      </div>
    </div>
  );
}
