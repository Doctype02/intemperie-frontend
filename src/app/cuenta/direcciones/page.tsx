"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressForm } from "@/components/checkout/address-form";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "@/lib/api/orders";
import type { Address } from "@/types";
import type { AddressInput } from "@/lib/validators";

/* Mis direcciones. El portero de sesión es AccountShell; aquí sólo vive el
 * CRUD (Dialog + AddressForm), cuya lógica no cambia. */

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch {
        toast.error("No se pudieron cargar tus direcciones. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleAddAddress = async (data: AddressInput) => {
    setIsSubmitting(true);
    try {
      const newAddress = await createAddress({
        street: data.street,
        city: data.city,
        province: data.province,
        country: data.country ?? "Panama",
        postalCode: data.postalCode,
        phone: data.phone,
        isDefault: data.isDefault ?? false,
      });
      setAddresses((prev) => [...prev, newAddress]);
      setAddDialogOpen(false);
      toast.success("Dirección agregada correctamente");
    } catch {
      toast.error("No se pudo guardar la dirección. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAddress = async (data: AddressInput) => {
    if (!editingAddress) return;
    setIsSubmitting(true);
    try {
      const updated = await updateAddress(editingAddress.id, {
        street: data.street,
        city: data.city,
        province: data.province,
        country: data.country ?? "Panama",
        postalCode: data.postalCode,
        phone: data.phone,
        isDefault: data.isDefault ?? false,
      });
      setAddresses((prev) => prev.map((a) => a.id === updated.id ? updated : a));
      setEditingAddress(null);
      toast.success("Dirección actualizada correctamente");
    } catch {
      toast.error("No se pudo actualizar la dirección. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Dirección eliminada");
    } catch {
      toast.error("No se pudo eliminar la dirección. Intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-8 w-48 rounded bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
          <div className="h-24 rounded-xl bg-surface-2" />
        </div>
        <p role="status" className="sr-only">
          Cargando tus direcciones…
        </p>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Mis direcciones</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus aria-hidden="true" /> Agregar dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface px-4 py-12 text-center sm:px-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-surface-2">
            <MapPin className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No tienes direcciones guardadas
          </h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Agrega una dirección para agilizar tus compras.
          </p>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus aria-hidden="true" /> Agregar dirección
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-muted-foreground">{address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.province}
                    {address.postalCode ? ` ${address.postalCode}` : ""}
                  </p>
                  <p className="tabular text-sm text-muted-foreground">{address.phone}</p>
                  {address.isDefault && (
                    <Badge variant="secondary" className="mt-1">
                      Predeterminada
                    </Badge>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar dirección ${address.street}`}
                    onClick={() => setEditingAddress(address)}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Eliminar dirección ${address.street}`}
                    onClick={() => setDeletingId(address.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agregar dirección */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Dirección</DialogTitle>
          </DialogHeader>
          <AddressForm onSubmit={handleAddAddress} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Editar dirección */}
      <Dialog open={!!editingAddress} onOpenChange={(o) => { if (!o) setEditingAddress(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dirección</DialogTitle>
          </DialogHeader>
          {editingAddress && (
            <AddressForm
              onSubmit={handleUpdateAddress}
              isSubmitting={isSubmitting}
              defaultValues={editingAddress}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={!!deletingId} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar dirección?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <div className="mt-2 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
