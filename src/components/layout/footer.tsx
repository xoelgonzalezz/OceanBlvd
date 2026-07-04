import Link from "next/link";
import { Disc3 } from "lucide-react";

import { NewsletterForm } from "@/components/shared/newsletter-form";
import { PaymentMethods } from "@/components/layout/payment-methods";
import { SOCIAL_LINKS, SITE } from "@/lib/constants";
import { getDict } from "@/i18n/server";

export function Footer() {
  const t = getDict();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t.footer.colShop,
      links: [
        { label: t.footer.linkNew, href: "/tienda?sort=newest" },
        { label: t.footer.linkBest, href: "/tienda?sort=popular" },
        { label: t.footer.linkUsed, href: "/tienda?condition=USED" },
        { label: t.footer.linkAll, href: "/tienda" },
      ],
    },
    {
      title: t.footer.colDiscover,
      links: [
        { label: t.footer.linkArtists, href: "/artistas" },
        { label: t.footer.linkBlog, href: "/blog" },
        { label: t.footer.linkAbout, href: "/sobre-nosotros" },
      ],
    },
    {
      title: t.footer.colHelp,
      links: [
        { label: t.footer.linkShipping, href: "/envios" },
        { label: t.footer.linkFaq, href: "/faq" },
        { label: t.footer.linkContact, href: "/contacto" },
      ],
    },
  ];

  const legalLinks = [
    { label: t.footer.legalNotice, href: "/legal/aviso-legal" },
    { label: t.footer.privacy, href: "/legal/privacidad" },
    { label: t.footer.terms, href: "/legal/condiciones" },
    { label: t.footer.returns, href: "/legal/devoluciones" },
    { label: t.footer.cookies, href: "/legal/cookies" },
  ];

  return (
    <footer className="grain relative mt-24 overflow-hidden border-t border-border/60 bg-secondary/30">
      <div className="container relative z-10 py-16">
        <div className="flex flex-col gap-8 border-b border-border/60 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-semibold">
              {t.footer.nlTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.footer.nlDesc}</p>
          </div>
          <NewsletterForm className="lg:max-w-sm lg:justify-self-end" />
        </div>

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

          {columns.map((col) => (
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

        <PaymentMethods className="border-t border-border/60 pt-8" />

        <div className="mt-8 border-t border-border/60 pt-8">
          <ul className="mb-6 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} {SITE.name}. {t.footer.rights}
          </p>
          {SOCIAL_LINKS.length > 0 && (
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
          )}
          </div>
        </div>
      </div>
    </footer>
  );
}
