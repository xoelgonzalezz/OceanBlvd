"use client";

import { useEffect } from "react";

import { useCart } from "@/store/cart";

/** Vacía el carrito al montar (página de éxito tras el pago). */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
