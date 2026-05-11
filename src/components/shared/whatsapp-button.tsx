"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WHATSAPP_NUMBER } from "@/lib/utils";

export function WhatsAppButton() {
  const handleClick = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola Intemperie! Me interesan sus productos.")}`,
      "_blank"
    );
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg p-0"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="sr-only">Chatea por WhatsApp</span>
    </Button>
  );
}
