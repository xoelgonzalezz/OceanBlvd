import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPostBySlug, getPosts } from "@/lib/queries";
import { formatDate, truncate, jsonLd, safeImg } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { getDict, getLocale, pick } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Artículo no encontrado" };

  const description = pick(getLocale(), post.excerpt, post.excerptEn);
  const ogImage = post.coverImage ?? "/og-default.png";
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.publishedAt.toISOString(),
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const others = (await getPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const t = getDict();
  const locale = getLocale();
  const paragraphs = pick(locale, post.content, post.contentEn)
    .split(/\n\s*\n/)
    .filter(Boolean);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: pick(locale, post.excerpt, post.excerptEn),
    image: [new URL(post.coverImage ?? "/og-default.png", SITE.url).toString()],
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    datePublished: post.publishedAt.toISOString(),
  };

  return (
    <article className="py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }}
      />
      <div className="container max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.blogPage.back}
        </Link>

        <header className="mt-6">
          {post.tag ? <Badge variant="muted">{post.tag}</Badge> : null}
          <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {t.blogPage.by} {post.author} · {formatDate(post.publishedAt, locale)}
          </p>
        </header>
      </div>

      <div className="container mt-8 max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={safeImg(post.coverImage, "/placeholders/blog-01.svg")}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="container mt-10 max-w-3xl">
        <div className="prose-editorial">
          <p className="text-lg font-medium text-foreground">
            {pick(locale, post.excerpt, post.excerptEn)}
          </p>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* Más artículos */}
      {others.length ? (
        <div className="container mt-20 max-w-5xl">
          <Separator className="mb-10" />
          <h2 className="mb-8 font-serif text-2xl font-semibold tracking-tight">
            {t.blogPage.more}
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {others.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={safeImg(p.coverImage, "/placeholders/blog-01.svg")}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-serif text-base font-medium leading-snug transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {truncate(pick(locale, p.excerpt, p.excerptEn), 90)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
