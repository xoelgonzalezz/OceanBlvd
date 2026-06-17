import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { getDict, getLocale } from "@/i18n/server";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = getLocale();
  const t = getDict();

  return (
    <LocaleProvider locale={locale}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          {t.header.skip}
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartSheet />
        <PageViewTracker />
      </div>
    </LocaleProvider>
  );
}
