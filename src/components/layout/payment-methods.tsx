import { getDict } from "@/i18n/server";

// Logos de pago (SVG en línea, sin dependencias ni imágenes externas).
// Reflejan los métodos que soporta Stripe (tarjeta, Apple Pay, Google Pay) más
// Bizum (pendiente de pasarela — ver docs/PROGRESO.md). Ajusta la lista según
// lo que finalmente acepte la pasarela real.

function Card({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-11 items-center justify-center rounded-[5px] border border-border bg-white"
    >
      {children}
    </span>
  );
}

function Visa() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-hidden>
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="15"
        fill="#1434CB"
      >
        VISA
      </text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 32 20" className="h-4 w-auto" aria-hidden>
      <circle cx="12" cy="10" r="8" fill="#EB001B" />
      <circle cx="20" cy="10" r="8" fill="#F79E1B" />
      <path
        d="M16 4a8 8 0 0 0 0 12 8 8 0 0 0 0-12Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function Paypal() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-hidden>
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontStyle="italic"
        fontSize="12"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

function ApplePay() {
  return (
    <svg viewBox="0 0 48 18" className="h-4 w-auto" aria-hidden fill="#000">
      <path d="M8.6 4.6c-.5.6-1.3 1-2 .95-.1-.8.28-1.65.73-2.17.5-.6 1.36-1.02 2.05-1.05.08.83-.25 1.65-.78 2.27Zm.77 1.22c-1.13-.07-2.1.64-2.64.64-.55 0-1.38-.6-2.28-.6-1.17.02-2.26.68-2.86 1.74-1.22 2.12-.32 5.25.87 6.98.58.84 1.28 1.79 2.2 1.75.87-.03 1.2-.56 2.26-.56 1.05 0 1.35.56 2.28.55.94-.02 1.54-.86 2.12-1.7.67-.98.94-1.92.96-1.97-.02-.02-1.84-.71-1.86-2.8-.02-1.76 1.43-2.6 1.5-2.64-.82-1.2-2.1-1.34-2.55-1.37Z" />
      <text
        x="26"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize="10"
        fill="#000"
      >
        Pay
      </text>
    </svg>
  );
}

function GooglePay() {
  return (
    <svg viewBox="0 0 48 18" className="h-4 w-auto" aria-hidden>
      <text
        x="2"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight="500"
        fontSize="11"
      >
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC04">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text
        x="34"
        y="14"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fontSize="11"
        fill="#5F6368"
      >
        Pay
      </text>
    </svg>
  );
}

function Bizum() {
  return (
    <svg viewBox="0 0 48 16" className="h-3.5 w-auto" aria-hidden>
      <text
        x="24"
        y="13"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="12"
        fill="#00C3E3"
      >
        bizum
      </text>
    </svg>
  );
}

export function PaymentMethods({ className }: { className?: string }) {
  const t = getDict();
  const methods = [
    { key: "Visa", el: <Visa /> },
    { key: "Mastercard", el: <Mastercard /> },
    { key: "PayPal", el: <Paypal /> },
    { key: "Apple Pay", el: <ApplePay /> },
    { key: "Google Pay", el: <GooglePay /> },
    { key: "Bizum", el: <Bizum /> },
  ];
  return (
    <div className={className}>
      <p className="mb-2 text-xs text-muted-foreground">{t.footer.payments}</p>
      <ul className="flex flex-wrap items-center gap-1.5">
        {methods.map((m) => (
          <li key={m.key}>
            <Card label={m.key}>{m.el}</Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
