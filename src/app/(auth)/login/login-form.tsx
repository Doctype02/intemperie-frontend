"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginResolver, type LoginInput } from "@/lib/validators";
import { login as loginApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

/** Sólo rutas internas: `?redirect=https://otro-sitio` no debe abrir nada. */
function safeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/cuenta";
  return value;
}

/* El backend responde con mensajes técnicos y a veces con ninguno. Un error de
 * acceso tiene que decir qué hacer a continuación, no sólo que algo falló. */
function describeError(err: unknown): string {
  const status = (err as { status?: number } | null)?.status;
  if (status === 0)
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.";
  if (status === 401 || status === 400)
    return "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.";
  if (status === 429)
    return "Demasiados intentos seguidos. Espera un minuto antes de volver a probar.";
  if (status && status >= 500)
    return "El servidor no respondió. Inténtalo en unos minutos o escríbenos por WhatsApp.";
  return err instanceof Error && err.message
    ? err.message
    : "No pudimos iniciar tu sesión. Inténtalo de nuevo.";
}

export function LoginFormFallback() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="h-[4.6rem] rounded-lg bg-surface-2" />
      <div className="h-[4.6rem] rounded-lg bg-surface-2" />
      <div className="h-13 rounded-lg bg-surface-2" />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: loginResolver,
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const redirect = safeRedirect(searchParams.get("redirect"));
  const registerHref =
    redirect === "/cuenta"
      ? "/registro"
      : `/registro?redirect=${encodeURIComponent(redirect)}`;

  const onSubmit = async (data: LoginInput) => {
    setFormError("");
    try {
      const result = await loginApi(data.email, data.password);
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
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id={`${emailId}-error`} className="text-sm font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={passwordId}>Contraseña</Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tu contraseña"
              className="pr-13"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
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
          {errors.password && (
            <p id={`${passwordId}-error`} className="text-sm font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="block" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      {/* Todavía no existe un flujo de recuperación en el backend: en lugar de
          un enlace muerto, la salida es el canal por el que ya se atiende. */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Olvidaste tu contraseña?{" "}
        <a
          href="https://wa.me/50762874042?text=Hola%2C%20no%20puedo%20entrar%20a%20mi%20cuenta%20de%20Intemperie"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-green-deep underline decoration-brand-green/40 decoration-2 underline-offset-4 hover:decoration-brand-green"
        >
          Escríbenos por WhatsApp
        </a>
      </p>

      <p className="mt-7 border-t border-hairline pt-6 text-center text-sm text-muted-foreground">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          href={registerHref}
          className="font-semibold text-brand-green-deep underline decoration-brand-green/40 decoration-2 underline-offset-4 hover:decoration-brand-green"
        >
          Crear una cuenta
        </Link>
      </p>
    </>
  );
}
