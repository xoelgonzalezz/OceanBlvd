import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes alguna duda? Escríbenos. Estaremos encantados de ayudarte a encontrar tu próximo vinilo.",
};

export default function ContactoPage() {
  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">Hablemos</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Contacto
        </h1>
        <p className="mt-3 text-muted-foreground">
          ¿Buscas un disco concreto, tienes una duda sobre un pedido o quieres
          vendernos tu colección? Escríbenos.
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="order-2 lg:order-1">
          <ContactForm />
        </div>

        <aside className="order-1 space-y-6 lg:order-2">
          <InfoItem icon={Mail} title="Email">
            <a
              href="mailto:hola@oceanblvdvinyl.com"
              className="hover:text-primary"
            >
              hola@oceanblvdvinyl.com
            </a>
          </InfoItem>
          <InfoItem icon={MapPin} title="Tienda física">
            Calle del Vinilo, 33
            <br />
            28004 Madrid, España
          </InfoItem>
          <InfoItem icon={Clock} title="Horario">
            Lun–Sáb: 10:00–20:30
            <br />
            Dom: cerrado
          </InfoItem>
        </aside>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-4 w-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          {title}
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
