"use client";

import { useId } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addressResolver, type AddressInput } from "@/lib/validators";
import type { Address } from "@/types";

interface AddressFormProps {
  onSubmit: (data: AddressInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<Address>;
}

/* Formulario de dirección — sistema «Perímetro».
 *
 * Los identificadores salen de `useId` y no están escritos a mano: la pantalla
 * de direcciones monta este formulario dos veces a la vez (alta y edición), y
 * con `id="phone"` fijo la segunda etiqueta apuntaba al campo de la primera.
 * Tocar «Teléfono» en el formulario de edición enfocaba el de arriba.
 *
 * Cada error se enlaza con su campo por `aria-describedby` y se anuncia con
 * `role="alert"`: quien navega con lector de pantalla se entera de que le falta
 * la provincia sin tener que recorrer el formulario campo por campo buscando
 * texto rojo.
 */
export function AddressForm({ onSubmit, isSubmitting, defaultValues }: AddressFormProps) {
  const uid = useId();
  const id = {
    phone: `${uid}-phone`,
    street: `${uid}-street`,
    city: `${uid}-city`,
    province: `${uid}-province`,
    postalCode: `${uid}-postal`,
    isDefault: `${uid}-default`,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: addressResolver,
    defaultValues: {
      street: defaultValues?.street || "",
      city: defaultValues?.city || "",
      province: defaultValues?.province || "",
      country: defaultValues?.country || "Panama",
      postalCode: defaultValues?.postalCode || "",
      phone: defaultValues?.phone || "",
      isDefault: defaultValues?.isDefault ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={id.phone}>Teléfono</Label>
        <Input
          id={id.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+507 6000-0000"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${id.phone}-error` : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p
            id={`${id.phone}-error`}
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={id.street}>Dirección</Label>
        <Input
          id={id.street}
          autoComplete="address-line1"
          placeholder="Calle, casa, apartamento, etc."
          aria-invalid={errors.street ? true : undefined}
          aria-describedby={errors.street ? `${id.street}-error` : undefined}
          {...register("street")}
        />
        {errors.street && (
          <p
            id={`${id.street}-error`}
            role="alert"
            className="text-sm font-medium text-destructive"
          >
            {errors.street.message}
          </p>
        )}
      </div>

      {/* Ciudad y provincia se reparten la fila sólo a partir de 640px: en un
          móvil de 360px dos campos en paralelo dejan a cada uno sin sitio para
          mostrar lo escrito. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={id.city}>Ciudad</Label>
          <Input
            id={id.city}
            autoComplete="address-level2"
            placeholder="La Chorrera"
            aria-invalid={errors.city ? true : undefined}
            aria-describedby={errors.city ? `${id.city}-error` : undefined}
            {...register("city")}
          />
          {errors.city && (
            <p
              id={`${id.city}-error`}
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {errors.city.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={id.province}>Provincia</Label>
          <Input
            id={id.province}
            autoComplete="address-level1"
            placeholder="Panamá Oeste"
            aria-invalid={errors.province ? true : undefined}
            aria-describedby={errors.province ? `${id.province}-error` : undefined}
            {...register("province")}
          />
          {errors.province && (
            <p
              id={`${id.province}-error`}
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {errors.province.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={id.postalCode}>
          Código postal
          <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id={id.postalCode}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="1001"
          {...register("postalCode")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={id.isDefault}
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked as boolean)}
        />
        <Label htmlFor={id.isDefault} className="cursor-pointer">
          Usar como dirección principal
        </Label>
      </div>

      {/* El estado de espera se dice con palabras además de con el giro del
          icono: un aspa que gira no es un mensaje para quien no la ve. */}
      <Button type="submit" size="block" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Guardando…
          </>
        ) : (
          "Guardar dirección"
        )}
      </Button>
    </form>
  );
}
