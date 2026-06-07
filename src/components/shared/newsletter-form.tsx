"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export function NewsletterForm({ className }: { className?: string }) {
  const t = useT();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
      toast.success(t.footer.nlSuccess, {
        description: t.footer.nlSuccessDesc,
      });
      setEmail("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo completar la suscripción."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative flex w-full max-w-sm items-center", className)}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.footer.nlPlaceholder}
        aria-label={t.footer.nlAria}
        className="h-11 rounded-full border-foreground/20 bg-background/60 pr-12"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Suscribirse"
        className="absolute right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 ease-out-quint hover:bg-primary/90 active:scale-90 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
