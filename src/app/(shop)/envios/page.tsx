import type { Metadata } from "next";
import { Truck, Package, RotateCcw, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Envíos y devoluciones",
  description:
    "Información sobre plazos, costes de envío y política de devoluciones de Ocean Blvd Vinyl.",
};

const HIGHLIGHTS = [
  { icon: Truck, title: "Envío 24–48h", text: "En la península, una vez preparado el pedido." },
  { icon: Package, title: "Gratis desde 60 €", text: "Por debajo, 4,99 € de envío estándar." },
  { icon: RotateCcw, title: "30 días", text: "Para devoluciones de discos sin precintar." },
  { icon: Globe, title: "Envío internacional", text: "Consúltanos para envíos fuera de España." },
];

export default function EnviosPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">Información</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Envíos y devoluciones
        </h1>
        <p className="mt-3 text-muted-foreground">
          Queremos que tus discos lleguen rápido, seguros e impecables.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="rounded-lg border bg-card p-4">
            <h.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{h.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{h.text}</p>
          </div>
        ))}
      </div>

      <div className="prose-editorial mt-10 max-w-none">
        <h2>Plazos y costes de envío</h2>
        <p>
          Preparamos todos los pedidos en un plazo de 24 horas laborables. El
          tiempo de entrega habitual es de 24 a 48 horas en la península. Para
          Baleares, Canarias, Ceuta y Melilla los plazos pueden variar
          ligeramente.
        </p>
        <p>
          El envío es <strong>gratuito a partir de 60 €</strong>. Para importes
          inferiores, aplicamos una tarifa plana de 4,99 € que verás siempre
          claramente antes de confirmar el pedido.
        </p>

        <h2>Embalaje</h2>
        <p>
          Cada disco viaja protegido con embalaje rígido específico para
          vinilos. Cuando es necesario, sustituimos o añadimos fundas internas
          antiestáticas para garantizar que tus discos lleguen en perfecto
          estado.
        </p>

        <h2>Devoluciones</h2>
        <p>
          Dispones de <strong>30 días</strong> desde la recepción para devolver
          cualquier disco que no esté precintado, siempre que conserve su estado
          original. Si la devolución se debe a un error nuestro o a un disco que
          no se corresponde con la descripción, asumimos los gastos y te
          ofrecemos cambio o reembolso completo.
        </p>
        <p>
          Para iniciar una devolución, escríbenos desde la página de{" "}
          <a href="/contacto">contacto</a> indicando tu número de pedido y te
          guiaremos en el proceso.
        </p>

        <h2>Seguimiento</h2>
        <p>
          En cuanto tu pedido salga de nuestro almacén recibirás un correo con
          la confirmación de envío y, si el transportista lo permite, un número
          de seguimiento.
        </p>
      </div>
    </div>
  );
}
