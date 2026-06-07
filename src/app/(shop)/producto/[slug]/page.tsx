import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";

import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { Tracklist } from "@/components/product/tracklist";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/price";
import { RecordGrid } from "@/components/shared/record-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { Separator } from "@/components/ui/separator";
import { toCartItem } from "@/lib/mappers";
import {
  CONDITION_LABELS,
  GRADE_DESCRIPTIONS,
  GRADE_LABELS,
} from "@/lib/constants";
import {
  getAllRecordSlugs,
  getRecordBySlug,
  getRelatedRecords,
} from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await getAllRecordSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const record = await getRecordBySlug(params.slug);
  if (!record) return { title: "Disco no encontrado" };

  const title = `${record.title} — ${record.artist.name}`;
  return {
    title,
    description: record.description,
    openGraph: {
      title,
      description: record.description,
      images: [
        { url: record.images[0]?.url ?? "/placeholders/og-default.svg" },
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const record = await getRecordBySlug(params.slug);
  if (!record) notFound();

  const related = await getRelatedRecords(record, 4);
  const lowStock = record.stock > 0 && record.stock <= 3;

  const details: { label: string; value: React.ReactNode }[] = [
    {
      label: "Artista",
      value: (
        <Link
          href={`/artistas/${record.artist.slug}`}
          className="text-primary hover:underline"
        >
          {record.artist.name}
        </Link>
      ),
    },
    { label: "Sello", value: record.label },
    { label: "Año", value: record.year },
    {
      label: "Género",
      value: (
        <Link
          href={`/tienda?genre=${record.genre.slug}`}
          className="hover:text-primary hover:underline"
        >
          {record.genre.name}
        </Link>
      ),
    },
    { label: "Formato", value: "Vinilo LP" },
    { label: "Estado", value: CONDITION_LABELS[record.condition] ?? record.condition },
    ...(record.mediaGrade
      ? [
          {
            label: "Calidad",
            value: GRADE_LABELS[record.mediaGrade] ?? record.mediaGrade,
          },
        ]
      : []),
  ];

  return (
    <div className="container py-8 md:py-12">
      {/* Migas de pan */}
      <nav
        aria-label="Migas de pan"
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tienda" className="hover:text-foreground">
          Tienda
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{record.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery images={record.images.map((i) => ({ url: i.url, alt: i.alt }))} />

        <div>
          <Link
            href={`/artistas/${record.artist.slug}`}
            className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
          >
            {record.artist.name}
          </Link>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {record.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ConditionBadge
              condition={record.condition}
              grade={record.mediaGrade}
              showGrade
            />
            <span className="text-sm text-muted-foreground">
              {record.genre.name} · {record.year}
            </span>
          </div>

          <div className="mt-6">
            <Price
              cents={record.priceCents}
              className="font-serif text-3xl font-semibold"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              IVA incluido. Envío calculado en el checkout.
            </p>
          </div>

          <div className="mt-6">
            <BuyBox item={toCartItem(record)} />
            <p className="mt-3 text-sm">
              {record.stock <= 0 ? (
                <span className="text-destructive">Agotado temporalmente</span>
              ) : lowStock ? (
                <span className="text-primary">
                  ¡Solo quedan {record.stock} en stock!
                </span>
              ) : (
                <span className="text-muted-foreground">En stock · listo para enviar</span>
              )}
            </p>
          </div>

          {/* Garantías */}
          <ul className="mt-6 grid gap-3 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              Envío 24–48h
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
              30 días devolución
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Estado garantizado
            </li>
          </ul>

          {/* Detalles */}
          <dl className="mt-6 divide-y divide-border/60 text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between py-2.5">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="font-medium text-right">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Descripción + Tracklist */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold">Descripción</h2>
          <p className="prose-editorial">{record.description}</p>

          {record.mediaGrade && GRADE_DESCRIPTIONS[record.mediaGrade] ? (
            <div className="mt-6 rounded-lg bg-secondary/40 p-4 text-sm">
              <p className="font-medium">
                Estado del disco: {GRADE_LABELS[record.mediaGrade]}
              </p>
              <p className="mt-1 text-muted-foreground">
                {GRADE_DESCRIPTIONS[record.mediaGrade]}
              </p>
            </div>
          ) : null}
        </div>

        <Tracklist tracks={record.tracks} />
      </div>

      {/* Relacionados */}
      {related.length ? (
        <div className="mt-20">
          <Separator className="mb-12" />
          <SectionHeading
            eyebrow="Quizá te guste"
            title="Discos relacionados"
          />
          <RecordGrid records={related} sizes="(max-width: 640px) 50vw, 25vw" />
        </div>
      ) : null}
    </div>
  );
}
