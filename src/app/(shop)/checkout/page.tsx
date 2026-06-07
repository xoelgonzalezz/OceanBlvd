import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { getDict } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Completa tus datos de envío para tramitar el pedido.",
  robots: { index: false },
};

export default function CheckoutPage() {
  const t = getDict();
  return (
    <div className="container py-10 md:py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          {t.checkout.title}
        </h1>
      </header>
      <CheckoutView />
    </div>
  );
}
