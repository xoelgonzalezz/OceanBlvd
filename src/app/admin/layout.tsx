import Link from "next/link";
import type { Metadata } from "next";
import { Disc3, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Disc3 className="h-5 w-5" />
            <span className="font-serif text-base font-semibold">
              Ocean Blvd
            </span>
            <span className="text-sm text-muted-foreground">Administración</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tienda
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
