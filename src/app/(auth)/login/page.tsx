"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { login as loginApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await loginApi(data.email, data.password);
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          className="h-11 rounded-xl border-gray-200 focus:ring-green-500"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-11 rounded-xl border-gray-200 focus:ring-green-500 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-[20px] font-black tracking-[-0.04em] text-gray-900 leading-none">
            INTEM<span className="text-green-700">PERIE</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a la tienda
          </Link>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-black text-gray-900">Bienvenido de vuelta</h1>
              <p className="mt-1.5 text-sm text-gray-500">Ingresa a tu cuenta para continuar</p>
            </div>
            <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-xl" />}>
              <LoginForm />
            </Suspense>
            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-bold text-green-700 hover:text-green-800 transition-colors">
                Crear cuenta gratis
              </Link>
            </p>
          </div>

          {/* Trust signals */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>🔒 Conexión segura SSL</span>
            <span>·</span>
            <span>Tus datos están protegidos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
