import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Introduce un correo válido."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Indica tu nombre."),
  email: z.string().email("Introduce un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().email("Introduce un correo válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Indica tu nombre."),
  email: z.string().email("Introduce un correo válido."),
  subject: z.string().min(2, "Indica un asunto."),
  message: z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)."),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Indica tu nombre y apellidos."),
  email: z.string().email("Introduce un correo válido."),
  address: z.string().min(4, "Indica tu dirección."),
  city: z.string().min(2, "Indica tu ciudad."),
  postalCode: z.string().min(3, "Indica tu código postal."),
  country: z.string().min(2, "Indica tu país."),
  phone: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
