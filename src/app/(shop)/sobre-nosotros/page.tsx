import Link from "next/link";
import type { Metadata } from "next";
import { Disc3, Heart, Recycle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Ocean Blvd Vinyl es una tienda independiente de discos de vinilo. Conoce nuestra historia y nuestra forma de entender la música.",
};

const CONTENT = {
  es: {
    eyebrow: "Nuestra historia",
    title: "La música, como debe sonar.",
    lead: "Ocean Blvd Vinyl nació de una obsesión sencilla: la de poner una aguja sobre un surco y dejar que el mundo se detenga durante el tiempo que dura una cara.",
    p1: "Empezamos como un pequeño puesto en mercadillos de discos, cargando cajas de vinilos los fines de semana y charlando durante horas con quien se acercaba. Con el tiempo, esa pasión se convirtió en una tienda: un lugar pensado para perderse entre estanterías, descubrir joyas descatalogadas y reencontrarse con clásicos que nunca pasan de moda.",
    h2a: "Por qué el vinilo",
    p2: "En un mundo de reproducción instantánea, el vinilo nos obliga a elegir, a escuchar de principio a fin, a sostener una portada entre las manos. Creemos que esa intención cambia la forma en que vivimos la música. Por eso cuidamos cada detalle, desde la calidad del prensaje hasta el estado de cada funda.",
    h2b: "Nuestro compromiso",
    p3: "Trabajamos tanto con novedades y reediciones de primera calidad como con discos de segunda mano cuidadosamente seleccionados y clasificados. Apostamos por la economía circular de la música: dar una segunda (o tercera) vida a discos que merecen seguir sonando.",
    values: [
      { icon: Sparkles, title: "Selección de autor", text: "Cada disco entra por una razón. No vendemos catálogo infinito, vendemos criterio." },
      { icon: Recycle, title: "Segunda mano con garantía", text: "Revisamos y clasificamos cada vinilo usado con el estándar Goldmine. Sin sorpresas." },
      { icon: Heart, title: "Hecho por melómanos", text: "Somos gente que escucha discos enteros. Te asesoramos como nos gustaría que lo hicieran con nosotros." },
    ],
    stats: [
      { n: "500+", l: "Títulos en catálogo" },
      { n: "15", l: "Artistas destacados" },
      { n: "8", l: "Géneros" },
      { n: "10+", l: "Años escuchando" },
    ],
    ctaTitle: "¿Listo para tu próxima escucha?",
    ctaButton: "Explorar el catálogo",
  },
  en: {
    eyebrow: "Our story",
    title: "Music, the way it should sound.",
    lead: "Ocean Blvd Vinyl was born from a simple obsession: dropping a needle onto a groove and letting the world pause for as long as a side lasts.",
    p1: "We started as a small stall at record fairs, hauling crates of vinyl every weekend and chatting for hours with anyone who stopped by. Over time, that passion became a shop: a place made for getting lost among the shelves, unearthing out-of-print gems and reuniting with classics that never go out of style.",
    h2a: "Why vinyl",
    p2: "In a world of instant playback, vinyl forces us to choose, to listen from start to finish, to hold a sleeve in our hands. We believe that intention changes the way we experience music. That's why we care for every detail, from the pressing quality to the state of each sleeve.",
    h2b: "Our commitment",
    p3: "We work with both top-quality new releases and reissues and carefully selected, graded second-hand records. We believe in the circular economy of music: giving a second (or third) life to records that deserve to keep playing.",
    values: [
      { icon: Sparkles, title: "Curated selection", text: "Every record is here for a reason. We don't sell an endless catalogue, we sell judgement." },
      { icon: Recycle, title: "Guaranteed second-hand", text: "We check and grade every used record with the Goldmine standard. No surprises." },
      { icon: Heart, title: "Made by music lovers", text: "We're people who listen to whole records. We advise you the way we'd want to be advised." },
    ],
    stats: [
      { n: "500+", l: "Titles in catalogue" },
      { n: "15", l: "Featured artists" },
      { n: "8", l: "Genres" },
      { n: "10+", l: "Years listening" },
    ],
    ctaTitle: "Ready for your next listen?",
    ctaButton: "Browse the catalogue",
  },
};

export default function SobreNosotrosPage() {
  const locale = getLocale();
  const c = CONTENT[locale === "en" ? "en" : "es"];

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-3xl">
        <span className="section-eyebrow">{c.eyebrow}</span>
        <h1 className="mt-2 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {c.title}
        </h1>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="prose-editorial max-w-none">
          <p className="text-lg font-medium text-foreground">{c.lead}</p>
          <p>{c.p1}</p>
          <h2>{c.h2a}</h2>
          <p>{c.p2}</p>
          <h2>{c.h2b}</h2>
          <p>{c.p3}</p>
        </div>

        <div className="space-y-4">
          {c.values.map((v) => (
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

      <div className="mt-16 grid grid-cols-2 gap-6 rounded-2xl border bg-secondary/30 p-8 text-center sm:grid-cols-4">
        {c.stats.map((s) => (
          <div key={s.l}>
            <p className="font-serif text-3xl font-semibold text-primary">{s.n}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 text-center">
        <Disc3 className="h-8 w-8 text-primary" />
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          {c.ctaTitle}
        </h2>
        <Button asChild size="lg">
          <Link href="/tienda">{c.ctaButton}</Link>
        </Button>
      </div>
    </div>
  );
}
