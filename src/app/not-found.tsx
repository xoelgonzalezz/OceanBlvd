import Link from "next/link";
import { Disc3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n/server";

export default function NotFound() {
  const t = getDict();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Disc3 className="h-6 w-6 text-primary" />
            <span className="font-serif text-lg font-semibold tracking-tight">
              Ocean Blvd <span className="text-primary">Vinyl</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <Disc3 className="h-12 w-12 text-primary motion-safe:animate-spin-slow" />
        <p className="mt-6 font-serif text-6xl font-semibold tracking-tight">
          404
        </p>
        <h1 className="mt-3 font-serif text-2xl font-medium">
          {t.notFound.title}
        </h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          {t.notFound.desc}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">{t.notFound.home}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tienda">{t.notFound.shop}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
