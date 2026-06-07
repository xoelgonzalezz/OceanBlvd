import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminPosts } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Blog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} artículos.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus /> Nuevo artículo
          </Link>
        </Button>
      </div>

      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/blog/${p.id}/edit`}
              className="flex items-center gap-4 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={p.coverImage ?? "/placeholders/blog-01.svg"}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.author} · {formatDate(p.publishedAt)}
                </p>
              </div>
              {p.tag ? <Badge variant="muted">{p.tag}</Badge> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
