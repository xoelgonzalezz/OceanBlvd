"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { useCart, useCartHydrated, useCartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { calcShipping } from "@/lib/constants";

const initialForm = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "España",
  phone: "",
  notes: "",
};

export function CheckoutView() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();
  const hydrated = useCartHydrated();

  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;

  const [form, setForm] = React.useState(initialForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  if (!hydrated) return <div className="h-64" aria-hidden />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Tu carrito está vacío"
        description="Añade algún disco antes de tramitar el pedido."
        actionLabel="Explorar catálogo"
        actionHref="/tienda"
      />
    );
  }

  const set = (k: keyof typeof initialForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldErrors = data.issues?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        if (fieldErrors) {
          const mapped: Record<string, string> = {};
          for (const k of Object.keys(fieldErrors)) {
            if (fieldErrors[k]?.[0]) mapped[k] = fieldErrors[k][0];
          }
          setErrors(mapped);
        }
        throw new Error(data.error ?? "No se pudo procesar el pedido.");
      }
      clear();
      router.push(`/checkout/exito?order=${data.orderId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo procesar el pedido."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      {/* Datos de envío */}
      <div>
        <h2 className="font-serif text-xl font-semibold">Datos de envío</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            id="fullName"
            label="Nombre y apellidos"
            className="sm:col-span-2"
            value={form.fullName}
            onChange={(v) => set("fullName", v)}
            error={errors.fullName}
            autoComplete="name"
          />
          <Field
            id="email"
            label="Correo electrónico"
            type="email"
            className="sm:col-span-2"
            value={form.email}
            onChange={(v) => set("email", v)}
            error={errors.email}
            autoComplete="email"
          />
          <Field
            id="address"
            label="Dirección"
            className="sm:col-span-2"
            value={form.address}
            onChange={(v) => set("address", v)}
            error={errors.address}
            autoComplete="street-address"
          />
          <Field
            id="city"
            label="Ciudad"
            value={form.city}
            onChange={(v) => set("city", v)}
            error={errors.city}
            autoComplete="address-level2"
          />
          <Field
            id="postalCode"
            label="Código postal"
            value={form.postalCode}
            onChange={(v) => set("postalCode", v)}
            error={errors.postalCode}
            autoComplete="postal-code"
          />
          <Field
            id="country"
            label="País"
            value={form.country}
            onChange={(v) => set("country", v)}
            error={errors.country}
            autoComplete="country-name"
          />
          <Field
            id="phone"
            label="Teléfono (opcional)"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            error={errors.phone}
            autoComplete="tel"
            required={false}
          />
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notas del pedido (opcional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="¿Algo que debamos saber sobre tu envío?"
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-md bg-secondary/40 p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Pasarela de pago <strong>simulada</strong> para esta demo. No se
            realizará ningún cargo ni se solicitan datos de tarjeta.
          </p>
        </div>
      </div>

      {/* Resumen */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Tu pedido</h2>

          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.artist}
                  </p>
                </div>
                <span className="text-sm tabular-nums">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Envío</dt>
              <dd className="tabular-nums">
                {shipping === 0 ? "Gratis" : formatPrice(shipping)}
              </dd>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <dt className="font-serif font-semibold">Total</dt>
              <dd className="font-serif font-semibold tabular-nums">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-6 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Procesando…
              </>
            ) : (
              <>
                <Lock /> Pagar {formatPrice(total)}
              </>
            )}
          </Button>
          <Link
            href="/carrito"
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Volver al carrito
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  className,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  className?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={!!error}
        className="mt-1.5"
      />
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
