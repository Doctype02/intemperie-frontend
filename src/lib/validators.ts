import type { FieldValues, Resolver } from "react-hook-form";

/* Validación de formularios — sin Zod en el navegador.
 *
 * Medido: `import { z } from "zod"` producía un chunk de 305 kB sin comprimir
 * (59.5 kB brotli) que se descargaba en /login, /registro, /checkout y
 * /cuenta/direcciones. Pasar a `zod/mini` sólo bajó a 287 kB: el peso no está
 * en los validadores que se usan sino en el núcleo compartido (registro de
 * metadatos, mapa de errores, tabla de formatos de string), que no se elimina
 * por tree-shaking porque el núcleo se referencia a sí mismo.
 *
 * Lo que este fichero necesitaba de Zod eran tres reglas: longitud mínima,
 * formato de correo e igualdad entre dos campos. Eso son las cuarenta líneas
 * de abajo, y salen 0 kB de dependencia.
 *
 * Contrato conservado bit a bit frente a `zodResolver`:
 *   - Devuelve `{ values, errors }`; con errores, `values` es `{}`.
 *   - `errors[campo] = { type, message }`, un único error por campo
 *     (equivale a criteriaMode "firstError", el valor por defecto de RHF).
 *   - Los mensajes y las rutas (`confirmPassword`) son los mismos de antes,
 *     así que el JSX de los formularios no cambia.
 *   - `min(n)` compara `String.length` sin recortar espacios, igual que Zod.
 */

type Issue = { path: string; message: string };

/** Envuelve una función de validación en un `Resolver` de react-hook-form. */
function makeResolver<T extends FieldValues>(
  validate: (values: T) => Issue[],
): Resolver<T> {
  return async (values) => {
    const issues = validate(values as T);
    if (issues.length === 0) return { values: values as T, errors: {} };

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of issues) {
      // Primer error por campo: los siguientes se descartan.
      if (!errors[issue.path]) {
        errors[issue.path] = { type: "validation", message: issue.message };
      }
    }
    return { values: {}, errors } as Awaited<ReturnType<Resolver<T>>>;
  };
}

const asString = (v: unknown): string => (typeof v === "string" ? v : "");

/** Longitud mínima sin recortar espacios (semántica de `z.string().min`). */
const minLength = (
  value: unknown,
  n: number,
  path: string,
  message: string,
): Issue[] => (asString(value).length >= n ? [] : [{ path, message }]);

/* Un `local@dominio.tld` con TLD de dos letras o más y sin espacios ni arrobas
 * duplicadas. Deliberadamente no intenta implementar RFC 5322: el correo real
 * se verifica en el backend al enviar. Aquí sólo se atrapa la errata evidente. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

const email = (value: unknown, path: string, message: string): Issue[] =>
  EMAIL_RE.test(asString(value)) ? [] : [{ path, message }];

const MSG = {
  email: "Ingrese un correo electrónico válido",
  password: "La contraseña debe tener al menos 6 caracteres",
} as const;

/* ── Tipos de formulario ──────────────────────────────────────────────────── */

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AddressInput {
  street: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  phone: string;
  isDefault?: boolean;
}

/* ── Resolvers ────────────────────────────────────────────────────────────── */

export const loginResolver = makeResolver<LoginInput>((v) => [
  ...email(v.email, "email", MSG.email),
  ...minLength(v.password, 6, "password", MSG.password),
]);

export const registerResolver = makeResolver<RegisterInput>((v) => [
  ...minLength(v.name, 2, "name", "El nombre debe tener al menos 2 caracteres"),
  ...email(v.email, "email", MSG.email),
  ...minLength(v.password, 6, "password", MSG.password),
  ...(v.password === v.confirmPassword
    ? []
    : [{ path: "confirmPassword", message: "Las contraseñas no coinciden" }]),
]);

export const addressResolver = makeResolver<AddressInput>((v) => [
  ...minLength(v.street, 5, "street", "La dirección es requerida"),
  ...minLength(v.city, 2, "city", "La ciudad es requerida"),
  ...minLength(v.province, 2, "province", "La provincia es requerida"),
  ...minLength(v.country, 1, "country", "El país es requerido"),
  ...minLength(v.phone, 8, "phone", "El teléfono debe tener al menos 8 dígitos"),
]);
