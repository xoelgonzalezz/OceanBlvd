import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { BlogForm } from "@/components/admin/blog-form";
import { createBlogAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function NewBlogPage() {
  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al blog
      </Link>
      <h1 className="mb-8 mt-4 font-serif text-3xl font-semibold tracking-tight">
        Nuevo artículo
      </h1>
      <BlogForm action={createBlogAction} submitLabel="Publicar artículo" />
    </div>
  );
}
