import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@prisma/client";

import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate, safeImg } from "@/lib/utils";
import { blogTag } from "@/lib/constants";
import { getDict, getLocale, pick } from "@/i18n/server";

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  const t = getDict();
  const locale = getLocale();
  if (!posts.length) return null;

  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        eyebrow={t.home.blogEyebrow}
        title={t.home.blogTitle}
        description={t.home.blogDesc}
        href="/blog"
        linkLabel={t.home.blogLink}
      />
      <div className="grid gap-8 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.05}>
            <Link href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
                <Image
                  src={safeImg(post.coverImage, "/placeholders/blog-01.svg")}
                  alt={pick(locale, post.title, post.titleEn)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out-quint group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                {post.tag ? (
                  <Badge variant="muted">{blogTag(post.tag, locale)}</Badge>
                ) : null}
                <h3 className="mt-2 font-serif text-xl font-medium leading-snug transition-colors group-hover:text-primary">
                  {pick(locale, post.title, post.titleEn)}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {pick(locale, post.excerpt, post.excerptEn)}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {post.author} · {formatDate(post.publishedAt, locale)}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
