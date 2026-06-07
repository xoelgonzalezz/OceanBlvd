import Link from "next/link";
import { Disc3 } from "lucide-react";

import { NewsletterForm } from "@/components/shared/newsletter-form";
import { FOOTER_NAV } from "@/lib/nav";
import { SOCIAL_LINKS, SITE } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/30">
      <div className="container py-16">
        {/* Newsletter */}
        <div className="flex flex-col gap-8 border-b border-border/60 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              No te pierdas ninguna novedad
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Suscríbete y recibe nuestras últimas incorporaciones, ediciones
              especiales y rarezas antes que nadie.
            </p>
          </div>
          <NewsletterForm className="lg:justify-self-end" />
        </div>

        {/* Enlaces */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Disc3 className="h-6 w-6 text-primary" />
              <span className="font-serif text-lg font-semibold tracking-tight">
                Ocean Blvd Vinyl
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/75 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barra inferior */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} {SITE.name}. Hecho con cariño por la música.
          </p>
          <ul className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {social.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
