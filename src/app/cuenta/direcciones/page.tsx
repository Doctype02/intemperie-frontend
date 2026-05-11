"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
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
import { getAddresses, createAddress, deleteAddress } from "@/lib/api/orders";
import type { Address } from "@/types";
import type { AddressInput } from "@/lib/validators";

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [isAuthenticated, router]);

  const handleAddAddress = async (data: AddressInput) => {
    setIsSubmitting(true);
    try {
      const newAddress = await createAddress(data as Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">);
      setAddresses((prev) => [...prev, newAddress]);
      setDialogOpen(false);
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently fail
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
        <Button onClick={() => setDialogOpen(true)} className="bg-green-700 hover:bg-green-800">
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
          <Button onClick={() => setDialogOpen(true)} className="bg-green-700 hover:bg-green-800">
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
                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    {address.isDefault && (
                      <p className="text-xs text-green-700 font-medium mt-1">Dirección principal</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(address.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Dirección</DialogTitle>
          </DialogHeader>
          <AddressForm onSubmit={handleAddAddress} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
