"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerResolver, type RegisterInput } from "@/lib/validators";
import { register as registerApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

/** Sólo rutas internas: `?redirect=https://otro-sitio` no debe abrir nada. */
function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/cuenta";
  return value;
}

function describeError(err: unknown): string {
  const status = (err as { status?: number } | null)?.status;
  const message = err instanceof Error ? err.message : "";

  if (status === 0)
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.";
  if (status === 409 || /existe|registrad|already/i.test(message))
    return "Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.";
  if (status === 429)
    return "Demasiados intentos seguidos. Espera un minuto antes de volver a probar.";
  if (status && status >= 500)
    return "El servidor no respondió. Inténtalo en unos minutos o escríbenos por WhatsApp.";
  return message || "No pudimos crear tu cuenta. Inténtalo de nuevo.";
}

export function RegisterFormFallback() {
  return (
    <div className="space-y-5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-[4.6rem] rounded-lg bg-surface-2" />
      ))}
      <div className="h-13 rounded-lg bg-surface-2" />
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const uid = useId();
  const nameId = `${uid}-name`;
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const confirmId = `${uid}-confirm`;

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: registerResolver,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const redirect = safeRedirect(searchParams.get("redirect"));
  const loginHref =
    redirect === "/cuenta"
      ? "/login"
      : `/login?redirect=${encodeURIComponent(redirect)}`;

  const onSubmit = async (data: RegisterInput) => {
    setFormError("");
    try {
      const result = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setFormError(describeError(err));
      setFocus("email");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {formError && (
          <p
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/35 bg-destructive/8 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor={nameId}>Nombre y apellido</Label>
          <Input
            id={nameId}
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Como quieres que te llamemos"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id={`${nameId}-error`} className="text-sm font-medium text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={emailId}>Correo electrónico</Label>
          <Input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email ? `${emailId}-error` : `${emailId}-hint`
            }
            {...register("email")}
          />
          {errors.email ? (
            <p id={`${emailId}-error`} className="text-sm font-medium text-destructive">
              {errors.email.message}
            </p>
          ) : (
            <p id={`${emailId}-hint`} className="text-xs text-muted-foreground">
              Aquí te enviamos la confirmación de tus pedidos.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={passwordId}>Contraseña</Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="pr-13"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password ? `${passwordId}-error` : `${passwordId}-hint`
              }
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-controls={passwordId}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
              ) : (
                <Eye className="h-4.5 w-4.5" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? "Ocultar la contraseña" : "Mostrar la contraseña"}
              </span>
            </button>
          </div>
          {errors.password ? (
            <p id={`${passwordId}-error`} className="text-sm font-medium text-destructive">
              {errors.password.message}
            </p>
          ) : (
            <p id={`${passwordId}-hint`} className="text-xs text-muted-foreground">
              Al menos 6 caracteres. Puedes verla con el ojo de la derecha.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={confirmId}>Repite la contraseña</Label>
          <Input
            id={confirmId}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="La misma de arriba"
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={
              errors.confirmPassword ? `${confirmId}-error` : undefined
            }
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p id={`${confirmId}-error`} className="text-sm font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" size="block" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Creando tu cuenta…
            </>
          ) : (
            "Crear cuenta"
          )}
        </Button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Al crear la cuenta aceptas los{" "}
          <Link
            href="/terminos"
            className="font-semibold text-brand-green-deep underline decoration-brand-green/40 decoration-2 underline-offset-2 hover:decoration-brand-green"
          >
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link
            href="/privacidad"
            className="font-semibold text-brand-green-deep underline decoration-brand-green/40 decoration-2 underline-offset-2 hover:decoration-brand-green"
          >
            política de privacidad
          </Link>
          .
        </p>
      </form>

      <p className="mt-7 border-t border-hairline pt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={loginHref}
          className="font-semibold text-brand-green-deep underline decoration-brand-green/40 decoration-2 underline-offset-4 hover:decoration-brand-green"
        >
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
