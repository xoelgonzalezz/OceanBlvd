import { Logo } from "@/components/layout/logo";
import { NavLink } from "@/components/layout/nav-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchCommand } from "@/components/layout/search-command";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { CartButton } from "@/components/layout/cart-button";
import { getDict } from "@/i18n/server";

export function Header() {
  const t = getDict();
  const nav = [
    { href: "/tienda", label: t.nav.shop },
    { href: "/artistas", label: t.nav.artists },
    { href: "/blog", label: t.nav.blog },
    { href: "/sobre-nosotros", label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-3 md:gap-6">
        <MobileNav />
        <Logo />

        <nav
          aria-label="Navegación principal"
          className="hidden lg:flex lg:items-center lg:gap-8"
        >
          {nav.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <SearchCommand />
          <LanguageToggle />
          <ThemeToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
