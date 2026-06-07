import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BlogForm, type BlogInitial } from "@/components/admin/blog-form";
import { deleteBlogAction, updateBlogAction } from "@/app/admin/actions";
import { getPostForEdit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPostForEdit(params.id);
  if (!post) notFound();

  const initial: BlogInitial = {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    tag: post.tag ?? "",
    coverImage: post.coverImage ?? "",
    excerptEn: post.excerptEn ?? "",
    contentEn: post.contentEn ?? "",
  };

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al blog
      </Link>
      <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Editar artículo
        </h1>
        <form action={deleteBlogAction}>
          <input type="hidden" name="id" value={post.id} />
          <Button
            type="submit"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 /> Eliminar
          </Button>
        </form>
      </div>
      <BlogForm
        action={updateBlogAction}
        initial={initial}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
