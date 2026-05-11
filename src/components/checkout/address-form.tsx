"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addressSchema, type AddressInput } from "@/lib/validators";
import type { Address } from "@/types";

interface AddressFormProps {
  onSubmit: (data: AddressInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Address>;
}

export function AddressForm({ onSubmit, isSubmitting, defaultValues }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      street: defaultValues?.street || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zipCode: defaultValues?.zipCode || "",
      phone: defaultValues?.phone || "",
      isDefault: defaultValues?.isDefault ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" {...register("fullName")} placeholder="Juan Pérez" />
        {errors.fullName && (
          <p className="text-sm text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register("phone")} placeholder="+507 6000-0000" />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Dirección</Label>
        <Input id="street" {...register("street")} placeholder="Calle, casa, apartamento, etc." />
        {errors.street && (
          <p className="text-sm text-red-500">{errors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...register("city")} placeholder="La Chorrera" />
          {errors.city && (
            <p className="text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Provincia</Label>
          <Input id="state" {...register("state")} placeholder="Panamá Oeste" />
          {errors.state && (
            <p className="text-sm text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">Código postal</Label>
        <Input id="zipCode" {...register("zipCode")} placeholder="1001" />
        {errors.zipCode && (
          <p className="text-sm text-red-500">{errors.zipCode.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isDefault"
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked as boolean)}
        />
        <Label htmlFor="isDefault" className="text-sm cursor-pointer">
          Usar como dirección principal
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-700 hover:bg-green-800"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  );
}
