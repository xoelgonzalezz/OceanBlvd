import Stripe from "stripe";

/** Cliente de Stripe (solo si hay clave configurada). */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/** Indica si el pago real con Stripe está habilitado. */
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
