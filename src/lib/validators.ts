import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Introduce un correo válido.").max(200),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Indica tu nombre.").max(80),
  email: z.string().email("Introduce un correo válido.").max(200),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(200),
});

export const loginSchema = z.object({
  email: z.string().email("Introduce un correo válido.").max(200),
  password: z.string().min(1, "Introduce tu contraseña.").max(200),
});

export const contactSchema = z.object({
  name: z
    .string({
      required_error: "Este campo es obligatorio.",
      invalid_type_error: "Este campo es obligatorio.",
    })
    .min(2, "Indica tu nombre.")
    .max(100),
  email: z
    .string({
      required_error: "Este campo es obligatorio.",
      invalid_type_error: "Este campo es obligatorio.",
    })
    .min(1, "Este campo es obligatorio.")
    .email("Correo no válido.")
    .max(200),
  subject: z
    .string({
      required_error: "Este campo es obligatorio.",
      invalid_type_error: "Este campo es obligatorio.",
    })
    .min(2, "Indica un asunto.")
    .max(150),
  message: z
    .string({
      required_error: "Este campo es obligatorio.",
      invalid_type_error: "Este campo es obligatorio.",
    })
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(5000),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Indica tu nombre y apellidos.").max(100),
  email: z.string().email("Introduce un correo válido.").max(200),
  address: z.string().min(4, "Indica tu dirección.").max(200),
  city: z.string().min(2, "Indica tu ciudad.").max(100),
  postalCode: z.string().min(3, "Indica tu código postal.").max(20),
  country: z.string().min(2, "Indica tu país.").max(60),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  discountCode: z.string().max(40).optional(),
  items: z
    .array(
      z.object({
        id: z.string().max(50),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1, "El carrito está vacío.")
    .max(100, "Demasiados artículos en el carrito."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
