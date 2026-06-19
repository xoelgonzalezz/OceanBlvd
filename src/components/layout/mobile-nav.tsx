"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Disc3, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const t = useT();

  const MAIN_NAV = [
    { label: t.nav.shop, href: "/tienda" },
    { label: t.nav.artists, href: "/artistas" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.about, href: "/sobre-nosotros" },
  ];
  const SECONDARY = [
    { label: t.account.myAccount, href: "/cuenta" },
    { label: t.footer.linkContact, href: "/contacto" },
    { label: t.footer.linkFaq, href: "/faq" },
    { label: t.footer.linkShipping, href: "/envios" },
  ];

  function MobileLink({ href, label }: { href: string; label: string }) {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={cn(
          "rounded-md px-3 py-2.5 font-serif text-lg transition-colors",
          active
            ? "bg-secondary text-foreground"
            : "text-foreground/70 hover:bg-secondary/60 hover:text-foreground"
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t.header.menu}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-primary" />
            Ocean Blvd Vinyl
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3">
          <MobileLink href="/" label={t.nav.home} />
          {MAIN_NAV.map((l) => (
            <MobileLink key={l.href} href={l.href} label={l.label} />
          ))}

          <Separator className="my-3" />

          {SECONDARY.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
