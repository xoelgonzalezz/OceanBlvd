"use client";

import * as React from "react";
import { Loader2, X, Disc3 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

// Marca en localStorage: una vez suscrito o descartado, no se vuelve a mostrar.
const SEEN_KEY = "ob_welcome";
const DELAY_MS = 12000; // aparece a los 12 s de navegar

export function WelcomePopup() {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Programa la aparición si el visitante no lo ha visto antes.
  React.useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(localStorage.getItem(SEEN_KEY));
    } catch {
      seen = false;
    }
    if (seen) return;
    const id = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const remember = React.useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sin localStorage: se mostrará otra vez, no pasa nada */
    }
  }, []);

  const dismiss = React.useCallback(() => {
    setOpen(false);
    remember();
  }, [remember]);

  // Cerrar con Escape.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setDone(true);
      remember();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo completar la suscripción."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.promo.title}
    >
      <button
        type="button"
        aria-label={t.promo.close}
        onClick={dismiss}
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-card p-7 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t.promo.close}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
            <Disc3 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight">
            {t.promo.title}
          </h2>

          {done ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.promo.success}
              </p>
              <Button onClick={dismiss} size="lg" className="mt-5 w-full">
                {t.promo.close}
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.promo.subtitle}
              </p>
              <form onSubmit={handleSubmit} className="mt-5 w-full space-y-3">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.promo.placeholder}
                  aria-label={t.promo.placeholder}
                  className="h-11 text-center"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> …
                    </>
                  ) : (
                    t.promo.cta
                  )}
                </Button>
              </form>
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                {t.promo.dismiss}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
