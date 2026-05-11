import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Ingrese un correo electrónico válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido"),
  street: z.string().min(5, "La dirección es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().min(2, "La provincia es requerida"),
  zipCode: z.string().min(1, "El código postal es requerido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  isDefault: z.boolean().optional(),
});

export const calculatorSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto"),
  linearMeters: z.number().min(1, "Ingrese al menos 1 metro lineal").max(10000, "Máximo 10,000 metros"),
  includeInstallation: z.boolean(),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Seleccione una dirección de envío"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CalculatorInput = z.infer<typeof calculatorSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
