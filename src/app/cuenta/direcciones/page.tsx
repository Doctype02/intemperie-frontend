"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/auth-store";
import { AddressForm } from "@/components/checkout/address-form";
import { getAddresses, createAddress, updateAddress, deleteAddress } from "@/lib/api/orders";
import type { Address } from "@/types";
import type { AddressInput } from "@/lib/validators";

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

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
  }, [isAuthenticated, router]);

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
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
        <div className="space-y-4">
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-green-700 hover:bg-green-800">
          <Plus className="h-4 w-4 mr-2" /> Agregar Dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Sin direcciones guardadas</h3>
          <p className="text-gray-500 mt-1 mb-6">
            Agrega una dirección para agilizar tus compras.
          </p>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-green-700 hover:bg-green-800">
            <Plus className="h-4 w-4 mr-2" /> Agregar Dirección
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.province}
                      {address.postalCode ? ` ${address.postalCode}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    {address.isDefault && (
                      <p className="text-xs text-green-700 font-medium mt-1">Dirección principal</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingAddress(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeletingId(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
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
