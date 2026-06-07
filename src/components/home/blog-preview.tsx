import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@prisma/client";

import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        eyebrow="El surco"
        title="Desde el blog"
        description="Cultura, lanzamientos y rarezas del mundo del vinilo."
        href="/blog"
        linkLabel="Ver todas las noticias"
      />
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.05}>
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
                <h3 className="mt-2 font-serif text-xl font-medium leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
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
    </section>
  );
}
