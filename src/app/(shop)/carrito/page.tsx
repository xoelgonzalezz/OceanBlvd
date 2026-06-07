import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { getDict } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa los discos de tu carrito antes de tramitar el pedido.",
  robots: { index: false },
};

export default function CarritoPage() {
  const t = getDict();
  return (
    <div className="container py-10 md:py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          {t.cart.title}
        </h1>
      </header>
      <CartView />
    </div>
  );
}
