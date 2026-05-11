"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { register as registerApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="h-9 w-9 rounded bg-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">I</span>
            </div>
            <span className="text-xl font-bold text-green-700">INTEMPERIE</span>
          </Link>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para realizar pedidos y dar seguimiento a tus compras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-green-700 hover:underline font-medium">
              Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
