import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";

import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { Tracklist } from "@/components/product/tracklist";
import { GradeInfo } from "@/components/product/grade-info";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/price";
import { RecordGrid } from "@/components/shared/record-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toCartItem } from "@/lib/mappers";
import {
  GRADE_DESCRIPTIONS,
  GRADE_DESCRIPTIONS_EN,
  GRADE_LABELS,
  SHIPPING_FLAT_CENTS,
  SITE,
} from "@/lib/constants";
import { jsonLd, truncate, safeImg } from "@/lib/utils";
import { Stars } from "@/components/reviews/stars";
import { ReviewSection } from "@/components/reviews/review-section";
import { getDict, getLocale, pick } from "@/i18n/server";
import {
  getRecordBySlug,
  getRecordRating,
  getRelatedRecords,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const record = await getRecordBySlug(params.slug);
  if (!record) return { title: "Disco no encontrado" };

  const locale = getLocale();
  const artist = record.artist.name;
  // Para el <title>: quita la edición entre paréntesis (queda corto y limpio).
  const album = record.title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const colorVal = locale === "en" ? record.colorEn ?? record.color : record.color;
  const color = colorVal ? ` ${colorVal}` : "";
  const onVinyl = locale === "en" ? "on vinyl" : "en vinilo";

  // Keyword de intención de compra al principio: "[Artista] – [Álbum] vinilo".
  const title = `${artist} – ${album} ${onVinyl}${color}`;
  const description = truncate(
    `${album} de ${artist} ${onVinyl}${color}. ${pick(locale, record.description, record.descriptionEn)}`,
    155
  );
  const ogImage = record.images[0]?.url ?? "/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: `/producto/${record.slug}` },
    openGraph: {
      // "music.album" es el og:type válido y más preciso para un vinilo (Next no
      // tipa "product"; Google Shopping usa el JSON-LD Product, ya presente).
      type: "music.album",
      title,
      description,
      url: `/producto/${record.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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
  const rating = await getRecordRating(record.id);
  const lowStock = record.stock > 0 && record.stock <= 3;
  const t = getDict();
  const locale = getLocale();

  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${record.title} — ${record.artist.name}`,
    image: [new URL(record.images[0]?.url ?? "/og-default.png", SITE.url).toString()],
    description: pick(locale, record.description, record.descriptionEn),
    sku: record.id,
    brand: { "@type": "Brand", name: record.artist.name },
    category: record.genre.name,
    releaseDate: String(record.year),
    // Estrellas en los resultados de Google cuando hay reseñas.
    ...(rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.avg.toFixed(1),
            reviewCount: rating.count,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: (record.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      priceValidUntil,
      availability:
        record.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        record.condition === "NEW"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
      url: new URL(`/producto/${record.slug}`, SITE.url).toString(),
      // Datos recomendados por Google para fichas de Shopping.
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (SHIPPING_FLAT_CENTS / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "ES",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ES",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 15,
      },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Tienda", item: new URL("/tienda", SITE.url).toString() },
      { "@type": "ListItem", position: 3, name: record.title },
    ],
  };

  const details: { label: string; value: React.ReactNode }[] = [
    {
      label: t.detail.artist,
      value: (
        <Link
          href={`/artistas/${record.artist.slug}`}
          className="text-primary hover:underline"
        >
          {record.artist.name}
        </Link>
      ),
    },
    { label: t.detail.label, value: record.label },
    { label: t.detail.year, value: record.year },
    {
      label: t.detail.genre,
      value: (
        <Link
          href={`/tienda?genre=${record.genre.slug}`}
          className="hover:text-primary hover:underline"
        >
          {record.genre.name}
        </Link>
      ),
    },
    { label: t.detail.format, value: t.detail.formatValue },
    {
      label: t.detail.condition,
      value: record.condition === "NEW" ? t.card.new : t.card.used,
    },
    ...(record.color
      ? [{ label: t.detail.color, value: pick(locale, record.color, record.colorEn) }]
      : []),
    ...(record.mediaGrade
      ? [
          {
            label: t.detail.grade,
            value: (
              <span className="inline-flex items-center gap-1.5">
                {GRADE_LABELS[record.mediaGrade] ?? record.mediaGrade}
                {GRADE_DESCRIPTIONS[record.mediaGrade] ? (
                  <GradeInfo
                    label={t.detail.gradeInfo}
                    text={pick(
                      locale,
                      GRADE_DESCRIPTIONS[record.mediaGrade],
                      GRADE_DESCRIPTIONS_EN[record.mediaGrade]
                    )}
                  />
                ) : null}
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="container py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }}
      />
      {/* Migas de pan */}
      <nav
        aria-label="Migas de pan"
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          {t.detail.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/tienda" className="hover:text-foreground">
          {t.detail.shop}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{record.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery
          images={record.images.map((i) => ({
            url: safeImg(i.url, "/placeholders/cover-01.svg"),
            alt: i.alt,
          }))}
        />

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

          {rating.count > 0 ? (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2">
              <Stars value={rating.avg} />
              <span className="text-sm text-muted-foreground">
                {rating.avg.toFixed(1)} · {t.reviews.basedOn(rating.count)}
              </span>
            </a>
          ) : null}

          <div className="mt-6">
            <Price
              cents={record.priceCents}
              className="font-serif text-3xl font-semibold"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {t.detail.taxNote}
            </p>
          </div>

          <div className="mt-6">
            <BuyBox item={toCartItem(record)} />
            <p className="mt-3 text-sm">
              {record.stock <= 0 ? (
                <span className="text-destructive">{t.detail.soldOutTemp}</span>
              ) : lowStock ? (
                <span className="text-primary">
                  {t.detail.lowStock(record.stock)}
                </span>
              ) : (
                <span className="text-muted-foreground">{t.detail.inStock}</span>
              )}
            </p>
          </div>

          {/* Garantías */}
          <ul className="mt-6 grid gap-3 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              {t.detail.ship}
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
              {t.detail.returns}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              {t.detail.guaranteed}
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

          <Button asChild variant="outline" className="mt-6 w-full sm:w-auto">
            <Link href={`/artistas/${record.artist.slug}`}>
              {t.detail.moreFrom(record.artist.name)}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Descripción + Tracklist */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold">
            {t.detail.description}
          </h2>
          <p className="prose-editorial">
            {pick(locale, record.description, record.descriptionEn)}
          </p>

          {record.mediaGrade && GRADE_DESCRIPTIONS[record.mediaGrade] ? (
            <div className="mt-6 rounded-lg bg-secondary/40 p-4 text-sm">
              <p className="font-medium">
                {t.detail.condition}: {GRADE_LABELS[record.mediaGrade]}
              </p>
              <p className="mt-1 text-muted-foreground">
                {pick(
                  locale,
                  GRADE_DESCRIPTIONS[record.mediaGrade],
                  GRADE_DESCRIPTIONS_EN[record.mediaGrade]
                )}
              </p>
            </div>
          ) : null}
        </div>

        <Tracklist tracks={record.tracks} />
      </div>

      {/* Reseñas */}
      <div id="reviews" className="scroll-mt-24">
        <ReviewSection recordId={record.id} slug={record.slug} />
      </div>

      {/* Relacionados */}
      {related.length ? (
        <div className="mt-20">
          <Separator className="mb-12" />
          <SectionHeading
            eyebrow={t.detail.relatedEyebrow}
            title={t.detail.relatedTitle}
          />
          <RecordGrid records={related} sizes="(max-width: 640px) 50vw, 25vw" />
        </div>
      ) : null}
    </div>
  );
}
