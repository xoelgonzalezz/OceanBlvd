import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/shared/reveal";
import { getPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "El surco: noticias, lanzamientos, ediciones especiales y cultura del vinilo desde Ocean Blvd Vinyl.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="container py-10 md:py-12">
      <header className="max-w-2xl">
        <span className="section-eyebrow">El surco</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Blog &amp; noticias
        </h1>
        <p className="mt-3 text-muted-foreground">
          Lanzamientos, ediciones especiales, guías y cultura del vinilo.
        </p>
      </header>

      {/* Artículo destacado */}
      {featured ? (
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="group mt-10 grid overflow-hidden rounded-2xl border bg-card md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
              <Image
                src={featured.coverImage ?? "/placeholders/blog-01.svg"}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-10">
              {featured.tag ? <Badge variant="muted">{featured.tag}</Badge> : null}
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight transition-colors group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {featured.author} · {formatDate(featured.publishedAt)}
              </p>
            </div>
          </Link>
        </Reveal>
      ) : null}

      {/* Resto de artículos */}
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post, i) => (
          <Reveal key={post.id} delay={Math.min(i, 6) * 0.05}>
            <Link href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                <Image
                  src={post.coverImage ?? "/placeholders/blog-01.svg"}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                {post.tag ? <Badge variant="muted">{post.tag}</Badge> : null}
                <h2 className="mt-2 font-serif text-xl font-medium leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {post.author} · {formatDate(post.publishedAt)}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
