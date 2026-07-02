"use client";

import * as React from "react";
import Script from "next/script";
import Link from "next/link";

import { useT } from "@/components/i18n/locale-provider";

// Clave de consentimiento. Valores: "granted" | "denied". Sin valor = aún no
// ha decidido → mostramos el banner. Guardamos en localStorage (no es una
// cookie de tracking: es la preferencia del usuario, base legal necesaria).
const CONSENT_KEY = "ob_consent";

type Consent = "unknown" | "granted" | "denied";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
/** ¿Hay al menos una herramienta de medición configurada? */
const HAS_TOOLS = Boolean(GA_ID || PIXEL_ID);

function readConsent(): Consent {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Gestiona el consentimiento (Consent Mode v2) y la carga de scripts de
 * medición. Ningún script de terceros (GA4, Meta Pixel) se descarga hasta que
 * el usuario acepta. Si no hay IDs configurados, no muestra nada.
 */
export function Analytics() {
  const t = useT();
  const [consent, setConsent] = React.useState<Consent>("unknown");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
  }, []);

  const decide = React.useCallback((value: "granted" | "denied") => {
    setConsent(value);
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* sin localStorage: se volverá a preguntar, no pasa nada */
    }
    // Consent Mode v2: informamos a gtag del cambio si ya está cargado.
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const state = value === "granted" ? "granted" : "denied";
      window.gtag("consent", "update", {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        analytics_storage: state,
      });
    }
    if (
      value === "granted" &&
      typeof window !== "undefined" &&
      typeof window.fbq === "function"
    ) {
      window.fbq("consent", "grant");
    }
  }, []);

  if (!HAS_TOOLS) return null;

  const showScripts = mounted && consent === "granted";
  const showBanner = mounted && consent === "unknown";

  return (
    <>
      {/* Consent Mode v2: por defecto TODO denegado. Es sólo JS local (define el
          stub de gtag y la preferencia por defecto); no hace ninguna petición
          de red. Los scripts de terceros se cargan más abajo, sólo tras aceptar. */}
      {GA_ID ? (
        <Script id="consent-default" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});`}
        </Script>
      ) : null}

      {showScripts && GA_ID ? (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent', 'update', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      ) : null}

      {showScripts && PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('consent', 'grant');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}

      {showBanner ? (
        <div
          role="dialog"
          aria-label={t.consent.title}
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-background/95 backdrop-blur-md"
        >
          <div className="container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t.consent.text}{" "}
              <Link
                href="/legal/cookies"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                {t.consent.policy}
              </Link>
              .
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                {t.consent.reject}
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t.consent.accept}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
