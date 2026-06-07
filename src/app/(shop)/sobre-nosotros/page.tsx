import Link from "next/link";
import type { Metadata } from "next";
import { Disc3, Heart, Recycle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Ocean Blvd Vinyl es una tienda independiente de discos de vinilo. Conoce nuestra historia y nuestra forma de entender la música.",
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Selección de autor",
    text: "Cada disco entra por una razón. No vendemos catálogo infinito, vendemos criterio.",
  },
  {
    icon: Recycle,
    title: "Segunda mano con garantía",
    text: "Revisamos y clasificamos cada vinilo usado con el estándar Goldmine. Sin sorpresas.",
  },
  {
    icon: Heart,
    title: "Hecho por melómanos",
    text: "Somos gente que escucha discos enteros. Te asesoramos como nos gustaría que lo hicieran con nosotros.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-3xl">
        <span className="section-eyebrow">Nuestra historia</span>
        <h1 className="mt-2 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          La música, como debe sonar.
        </h1>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="prose-editorial max-w-none">
          <p className="text-lg font-medium text-foreground">
            Ocean Blvd Vinyl nació de una obsesión sencilla: la de poner una
            aguja sobre un surco y dejar que el mundo se detenga durante el
            tiempo que dura una cara.
          </p>
          <p>
            Empezamos como un pequeño puesto en mercadillos de discos, cargando
            cajas de vinilos los fines de semana y charlando durante horas con
            quien se acercaba. Con el tiempo, esa pasión se convirtió en una
            tienda: un lugar pensado para perderse entre estanterías, descubrir
            joyas descatalogadas y reencontrarse con clásicos que nunca pasan de
            moda.
          </p>
          <h2>Por qué el vinilo</h2>
          <p>
            En un mundo de reproducción instantánea, el vinilo nos obliga a
            elegir, a escuchar de principio a fin, a sostener una portada entre
            las manos. Creemos que esa intención cambia la forma en que vivimos
            la música. Por eso cuidamos cada detalle, desde la calidad del
            prensaje hasta el estado de cada funda.
          </p>
          <h2>Nuestro compromiso</h2>
          <p>
            Trabajamos tanto con novedades y reediciones de primera calidad como
            con discos de segunda mano cuidadosamente seleccionados y
            clasificados. Apostamos por la economía circular de la música: dar
            una segunda (o tercera) vida a discos que merecen seguir sonando.
          </p>
        </div>

        <div className="space-y-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-lg border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-medium">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cifras */}
      <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border bg-secondary/30 p-8 text-center sm:grid-cols-4">
        {[
          { n: "500+", l: "Títulos en catálogo" },
          { n: "15", l: "Artistas destacados" },
          { n: "8", l: "Géneros" },
          { n: "10★", l: "Años escuchando" },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-serif text-3xl font-semibold text-primary">
              {s.n}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <Disc3 className="h-8 w-8 text-primary" />
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          ¿Listo para tu próxima escucha?
        </h2>
        <Button asChild size="lg">
          <Link href="/tienda">Explorar el catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
