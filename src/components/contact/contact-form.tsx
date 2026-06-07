"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/components/i18n/locale-provider";

const initial = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const t = useT();
  const [form, setForm] = React.useState(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const set = (k: keyof typeof initial, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        throw new Error(data.error ?? "No se pudo enviar el mensaje.");
      }
      toast.success(t.contact.success, {
        description: t.contact.successDesc,
      });
      setForm(initial);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo enviar el mensaje."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t.contact.name}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="mt-1.5"
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="email">{t.contact.email}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="mt-1.5"
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="subject">{t.contact.subject}</Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          required
          aria-invalid={!!errors.subject}
          className="mt-1.5"
        />
        {errors.subject ? (
          <p className="mt-1 text-xs text-destructive">{errors.subject}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="message">{t.contact.message}</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
          rows={6}
          aria-invalid={!!errors.message}
          className="mt-1.5"
        />
        {errors.message ? (
          <p className="mt-1 text-xs text-destructive">{errors.message}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> {t.contact.sending}
          </>
        ) : (
          <>
            <Send /> {t.contact.send}
          </>
        )}
      </Button>
    </form>
  );
}
