import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getLegalDoc, LEGAL_SLUGS, type LegalSlug } from "@/lib/legal";
import { getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";

function isLegalSlug(slug: string): slug is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(slug);
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  if (!isLegalSlug(params.slug)) return {};
  const doc = getLegalDoc(params.slug, getLocale() as "es" | "en");
  return {
    title: doc.title,
    alternates: { canonical: `/legal/${params.slug}` },
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  if (!isLegalSlug(params.slug)) notFound();
  const locale = getLocale() as "es" | "en";
  const doc = getLegalDoc(params.slug, locale);

  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        {doc.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{doc.updatedLabel}</p>
      {doc.intro ? (
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          {doc.intro}
        </p>
      ) : null}

      <div className="mt-10 space-y-9">
        {doc.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              {section.h}
            </h2>
            {section.p?.map((paragraph, j) => (
              <p key={j} className="mt-3 leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            ))}
            {section.list ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-foreground/80">
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
